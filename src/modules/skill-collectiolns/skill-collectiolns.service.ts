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
    // console.log('skillCollections', JSON.stringify(skillCollections));

    // Step 1: Group by root skill
    const rootSkillMap = new Map();

    skillCollections.forEach((sc) => {
      // Check if clo and skill exist
      if (!sc.clo || !sc.clo.skill) {
        return; // Skip this entry if skill is missing
      }

      const currentSkill = sc.clo.skill;
      let rootSkill = currentSkill;

      // Find root skill (keep traversing up until parent is null)
      while (rootSkill.parent) {
        rootSkill = rootSkill.parent;
      }

      const rootSkillId = rootSkill.id;
      const rootSkillName = rootSkill.engName;
      const domain = rootSkill.domain;

      if (!rootSkillMap.has(rootSkillId)) {
        rootSkillMap.set(rootSkillId, {
          root_skill: rootSkillName,
          domain: domain,
          leafNodes: [],
        });
      }

      // Check if it's not the parent node itself
      if (currentSkill.id !== rootSkillId) {
        // เป็น leaf node จริง
        rootSkillMap.get(rootSkillId).leafNodes.push(sc.gainedLevel);
      } else {
        // ถ้าไม่มีลูกจริง ๆ ให้ fallback ใช้ gainedLevel นี้
        const node = rootSkillMap.get(rootSkillId);
        if (node.leafNodes.length === 0) {
          node.leafNodes.push(sc.gainedLevel);
        }
      }
    });

    // Step 2: Calculate scores
    const result = [];
    rootSkillMap.forEach((value) => {
      const { root_skill, domain, leafNodes } = value;
      const leafCount = leafNodes.length;
      let score = 0;

      if (leafCount > 0) {
        score = calculateMode(leafNodes); // ✅ ใช้ mode
      }

      result.push({
        root_skill,
        domain,
        score,
      });
    });

    // Separate by domain: soft and hard
    const soft = result.filter(
      (item) => item.domain === 'คุณลักษณะบุคคล' || item.domain === 'จริยธรรม',
    );
    const specific = result.filter(
      (item) => item.domain === 'ทักษะ' || item.domain === 'ความรู้',
    );

    // // Get top 8 for each domain
    // soft = soft.sort((a, b) => b.score - a.score).slice(0, 8); // Sort by score desc
    // specific = specific.sort((a, b) => b.score - a.score).slice(0, 8);

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

function calculateMode(arr: number[]): number {
  const freqMap = new Map<number, number>();

  for (const num of arr) {
    freqMap.set(num, (freqMap.get(num) || 0) + 1);
  }

  let maxCount = 0;
  let modes: number[] = [];

  for (const [num, count] of freqMap.entries()) {
    if (count > maxCount) {
      maxCount = count;
      modes = [num];
    } else if (count === maxCount) {
      modes.push(num);
    }
  }

  // ถ้ามี mode หลายค่า ให้เลือกค่าที่มากที่สุด
  return Math.max(...modes);
}
