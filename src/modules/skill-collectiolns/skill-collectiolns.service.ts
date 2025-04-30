import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClosService } from '../clos/clos.service';
import { SkillCollection } from 'src/generated/nestjs-dto/skillCollection.entity';
import { StudentScoreList } from 'src/dto/filter-params.dto';
import { SkillCollectionDto } from 'src/generated/nestjs-dto/skillCollection.dto';

@Injectable()
export class SkillCollectionsService {
  constructor(
    private prisma: PrismaService,
    private cloService: ClosService,
  ) {}

  async getSkillCollectionsByStudentId(studentCode: string) {
    const student = await this.prisma.student.findUnique({
      where: { code: studentCode },
      include: {
        skill_collections: {
          include: {
            clo: true,
          },
        },
      },
    });

    // If no student is found, return empty result or throw an error
    if (!student) {
      return { specific: [], soft: [] }; // Or throw new Error('Student not found');
    }

    if (!student.skill_collections) {
      return { specific: [], soft: [] }; // Or throw new Error('student has no skill collections');
    }

    const skillCollections = await this.prisma.skill_collection.findMany({
      where: { studentId: student.id },
      select: {
        id: true,
        gainedLevel: true,
        passed: true,
        clo: {
          select: {
            id: true,
            name: true,
            expectSkillLevel: true,
            skill: {
              select: {
                id: true,
                thaiName: true,
                engName: true,
                domain: true,
                parent: {
                  select: {
                    id: true,
                    thaiName: true,
                    engName: true,
                    domain: true,
                    parent: {
                      select: {
                        id: true,
                        thaiName: true,
                        engName: true,
                        domain: true,
                        parent: {
                          select: {
                            id: true,
                            thaiName: true,
                            engName: true,
                            domain: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // สร้าง skillLevelMap เพื่อเก็บ gainedLevel ที่ดีที่สุดต่อ skillId
    const skillLevelMap = new Map<number, number>();
    skillCollections.forEach((sc) => {
      const skill = sc.clo?.skill;
      if (!skill) return;
      const current = skillLevelMap.get(skill.id) || 0;
      skillLevelMap.set(skill.id, Math.max(current, sc.gainedLevel));
    });

    // ดึงเฉพาะ skill ที่มีใน skillCollections
    const skillIds = new Set<number>();

    skillCollections.forEach((sc) => {
      let skill = sc.clo?.skill;
      while (skill) {
        skillIds.add(skill.id);
        skill = skill.parent;
      }
    });

    const relatedSkills = await this.prisma.skill.findMany({
      where: { id: { in: Array.from(skillIds) } },
      include: { parent: true },
    });

    // แปลง skill hierarchy เป็น tree (ใช้ข้อมูล parent)
    const skillMap = new Map<number, any>();
    for (const skill of relatedSkills) {
      skillMap.set(skill.id, {
        id: skill.id,
        name: skill.engName,
        domain: skill.domain,
        parentId: skill.parent?.id || null,
        gained: skillLevelMap.get(skill.id),
        subskills: [],
      });
    }

    // ต่อโครงสร้าง parent → children
    for (const node of skillMap.values()) {
      if (node.parentId) {
        const parent = skillMap.get(node.parentId);
        if (parent) parent.subskills.push(node);
      }
    }

    // เติม gained แบบ mode (recursive)
    function calculateMode(arr: number[]): number {
      const count = new Map<number, number>();
      arr.forEach((n) => count.set(n, (count.get(n) || 0) + 1));
      const max = Math.max(...count.values());
      const modes = [...count.entries()]
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, c]) => c === max)
        .map(([n]) => n);
      return Math.max(...modes);
    }

    function fillGained(node: any): number | undefined {
      if (!node.subskills.length) return node.gained;
      const childGained = node.subskills
        .map(fillGained)
        .filter((x) => x !== undefined) as number[];
      if (childGained.length > 0) node.gained = calculateMode(childGained);
      return node.gained;
    }

    const roots = [...skillMap.values()].filter((n) => n.parentId === null);
    roots.forEach(fillGained);

    //  แยก specific กับ soft และ return
    const specific = roots.filter(
      (r) => r.domain === 'ทักษะ' || r.domain === 'ความรู้',
    );
    const soft = roots.filter(
      (r) => r.domain === 'คุณลักษณะบุคคล' || r.domain === 'จริยธรรม',
    );

    return { specific, soft };
  }

  async getByCloId(
    courseId: number,
    cloId: number,
  ): Promise<Partial<SkillCollectionDto>[]> {
    return this.prisma.skill_collection.findMany({
      where: { courseId, cloId },
      select: {
        id: true,
        gainedLevel: true,
        passed: true,
        student: {
          select: {
            code: true,
            thaiName: true,
          },
        },
      },
      orderBy: { student: { code: 'asc' } },
    });
  }

  // import skill collections for students by clo id
  async importSkillCollections(
    courseId: number,
    cloId: number,
    studentScoreList: StudentScoreList[],
  ): Promise<SkillCollection[]> {
    console.log('Import Path 2', courseId, cloId, studentScoreList);
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    const clo = await this.cloService.findOne(cloId);

    const skillCollections = [];

    if (!course.subjectId) {
      throw new BadRequestException(
        'Course must have a subject before importing skill collections',
      );
    }

    if (!clo) {
      throw new NotFoundException(`CLO with ID ${cloId} not found`);
    }

    for (const studentScore of studentScoreList) {
      let student = await this.prisma.student.findUnique({
        where: { code: studentScore.studentCode },
      });
      if (!student) {
        // create student with code
        const newStudent = await this.prisma.student.create({
          data: {
            code: studentScore.studentCode,
          },
        });
        student = newStudent;
      }
      // check if student has skill collection of this course and clo
      let skillCollection = await this.prisma.skill_collection.findFirst({
        where: {
          studentId: student.id,
          courseId: course.id,
          cloId: clo.id,
        },
      });
      if (skillCollection) {
        // update skill collection
        skillCollection = await this.prisma.skill_collection.update({
          where: {
            id: skillCollection.id,
          },
          data: {
            gainedLevel: studentScore.gainedLevel,
            // check if score more than clo expect skill level
            passed:
              studentScore.gainedLevel >= clo.expectSkillLevel ? true : false,
          },
        });
      } else {
        // create skill collection for student
        skillCollection = await this.prisma.skill_collection.create({
          data: {
            studentId: student.id, // FK เชื่อมกับ student
            courseId: course.id, // FK เชื่อมกับ course
            cloId: clo.id, // FK เชื่อมกับ clo
            gainedLevel: studentScore.gainedLevel, // ค่าที่ได้จาก studentScore
            // check if score more than clo expect skill level
            passed:
              studentScore.gainedLevel >= clo.expectSkillLevel ? true : false,
          },
        });
      }

      skillCollections.push(skillCollection);
    }
    return skillCollections;
  }
}
