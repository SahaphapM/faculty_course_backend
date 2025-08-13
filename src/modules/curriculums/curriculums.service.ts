import {
  Injectable,
  NotFoundException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Adjust the import path as needed
import { Prisma } from '@prisma/client'; // Import Prisma types
import { CreateCurriculumDto } from 'src/generated/nestjs-dto/create-curriculum.dto';
import { UpdateCurriculumDto } from 'src/generated/nestjs-dto/update-curriculum.dto';
import { CurriculumFilterDto } from 'src/dto/filters/filter.curriculum.dto';
import {
  fetchSkillsWithCollections,
  generateSkillSummary,
  getSkillDomains,
  getStudentIds,
} from './curriculums.helper';
import { CreateLevelDescriptionDto } from 'src/generated/nestjs-dto/create-levelDescription.dto';
import { createPaginatedData } from 'src/utils/paginated.utils';

@Injectable()
export class CurriculumsService {
  constructor(private prisma: PrismaService) {}

  // Create a new curriculum
  async create(dto: CreateCurriculumDto, coordinatorId?: number) {
    const { branchId, ...rest } = dto;

    const curriculum = await this.prisma.curriculum.create({
      data: {
        ...rest,
        branch: branchId ? { connect: { id: branchId } } : undefined,
        ...(coordinatorId ? { coordinatorId } : {}),
      },
    });

    // defult level description
    const levels: CreateLevelDescriptionDto[] = [
      {
        level: 1,
        description:
          'สามารถอธิบายหลักการหรือแนวคิดพื้นฐานได้ ยังไม่สามารถนำไปปฏิบัติได้ด้วยตนเอง',
        isHardSkill: true,
        curriculumId: curriculum.id,
      },
      {
        level: 2,
        description: 'สามารถปฏิบัติงานได้เมื่อมีคนชี้แนะหรือติดตามใกล้ชิด',
        isHardSkill: true,
        curriculumId: curriculum.id,
      },
      {
        level: 3,
        description: 'สามารถทำงานได้สำเร็จโดยไม่ต้องมีคนคอยกำกับ',
        isHardSkill: true,
        curriculumId: curriculum.id,
      },
      {
        level: 4,
        description: 'ทำได้คล่องและปรับวิธีให้เหมาะสมกับสถานการณ์',
        isHardSkill: true,
        curriculumId: curriculum.id,
      },
      {
        level: 5,
        description: 'เป็นผู้เชี่ยวชาญ ให้คำปรึกษาหรือพัฒนาวิธีใหม่ได้',
        isHardSkill: true,
        curriculumId: curriculum.id,
      },
      {
        level: 1,
        description: 'เข้าใจหลักการสื่อสารที่ดี',
        isHardSkill: false,
        curriculumId: curriculum.id,
      },
      {
        level: 2,
        description: 'สามารถสื่อสารได้ชัดเจนเมื่อมีคำแนะนำหรือโครงสร้างช่วย',
        isHardSkill: false,
        curriculumId: curriculum.id,
      },
      {
        level: 3,
        description: 'จัดการความขัดแย้งหรือสถานการณ์ที่ซับซ้อนได้ด้วยตนเอง',
        isHardSkill: false,
        curriculumId: curriculum.id,
      },
    ];

    // for each curriculum
    await this.prisma.level_description.createMany({
      data: levels,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Curriculum created successfully',
      data: curriculum,
    };
  }

  // Find all curriculums with pagination and search
  async findAll(pag?: CurriculumFilterDto, coordinatorId?: number) {
    const defaultLimit = 15;
    const defaultPage = 1;

    const {
      limit,
      page,
      orderBy,
      sort,
      nameCode,
      degree,
      branchId,
      facultyId,
    } = pag || {};

    const whereCondition: Prisma.curriculumWhereInput = {
      ...(nameCode && {
        OR: [
          {
            thaiName: { contains: nameCode },
          },
          {
            engName: { contains: nameCode },
          },
          {
            code: { contains: nameCode },
          },
        ],
      }),
      ...(degree && {
        OR: [
          { engDegree: { contains: degree } },
          { thaiDegree: { contains: degree } },
        ],
      }),
      ...(branchId && { branchId }),
      ...(facultyId && { branch: { facultyId } }),
      ...(coordinatorId && { coordinatorId }),
    };

    const options: Prisma.curriculumFindManyArgs = {
      take: limit || defaultLimit,
      skip: ((page || defaultPage) - 1) * (limit || defaultLimit),
      orderBy: { [(sort === '' ? 'id' : sort) ?? 'id']: orderBy ?? 'asc' },
      include: {
        branch: {
          select: {
            id: true,
            thaiName: true,
            engName: true,
          },
        },
      },
      where: whereCondition,
    };

    const [curriculums, total] = await Promise.all([
      this.prisma.curriculum.findMany(options),
      this.prisma.curriculum.count({ where: whereCondition }),
    ]);

    return createPaginatedData(
      curriculums,
      total,
      Number(page || defaultPage),
      Number(limit || defaultLimit),
    );
  }

  // Find a curriculum by ID
  async findOne(id: number) {
    const curriculum = await this.prisma.curriculum.findUnique({
      where: { id },
    });

    if (!curriculum) {
      throw new NotFoundException(`Curriculum with ID ${id} not found`);
    }

    return curriculum;
  }

  // Find a curriculum by code with relations
  async findOneByCode(code: string) {
    const curriculum = await this.prisma.curriculum.findUnique({
      where: { code },
      include: {
        branch: true,
      },
    });

    if (!curriculum) {
      throw new NotFoundException(`Curriculum with code ${code} not found`);
    }

    return curriculum;
  }

  async update(id: number, dto: UpdateCurriculumDto) {
    try {
      const old = await this.prisma.curriculum.findUnique({ where: { id } });
      if (!old) {
        throw new NotFoundException(`Curriculum with ID ${id} not found`);
      }

      if (dto.code && dto.code !== old.code) {
        const codeExists = await this.prisma.curriculum.findFirst({
          where: {
            code: dto.code,
            NOT: { id },
          },
        });
        if (codeExists) {
          throw new BadRequestException(
            `Curriculum code "${dto.code}" is already in use.`,
          );
        }
      }

      const curriculum = await this.prisma.curriculum.update({
        where: { id },
        data: dto,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Curriculum updated successfully',
        data: curriculum,
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Curriculum with ID ${id} not found`);
      }
      throw new BadRequestException(
        'Failed to update curriculum: ' + error.message,
      );
    }
  }

  // Remove a curriculum by ID
  async remove(id: number): Promise<void> {
    await this.prisma.curriculum.delete({
      where: { id },
    });
  }

  async getSkillSummaryByCurriculum(
    curriculumId: number,
    yearCode: string,
    skillType: string,
  ) {
    const domains = getSkillDomains(skillType);

    const studentIds = await getStudentIds(curriculumId, yearCode);
    console.log('totalStudent', studentIds.length);

    // 3. Fetch skills with their CLOs and skill collections
    const skills = await fetchSkillsWithCollections(
      curriculumId,
      domains,
      studentIds,
    );
    console.log('totalSkills', skills);

    // 4. Process root skills and generate summary
    return generateSkillSummary(skills);
  }

  async findStudentsBySkillLevel(
    skillId: number,
    targetLevel: 'on' | 'above' | 'below' | 'all',
    yearCode: string, // 68 69 70
    page: number,
    limit: number,
    search?: string,
  ) {
    const offset = (page - 1) * limit;

    // 1. Find all descendant skills (including the root skill itself)
    const allSkills = await this.findAllDescendants(skillId);
    const skillIds = allSkills.map((skill) => skill.id);

    // 2. Find all CLOs related to these skills
    const closData = await this.prisma.clo.findMany({
      where: {
        skillId: { in: skillIds },
      },
      select: {
        id: true,
        expectSkillLevel: true,
        skill: {
          select: {
            id: true,
            thaiName: true,
            engName: true,
            domain: true,
          },
        },
      },
    });
    const cloIds = closData.map((clo) => clo.id);

    if (cloIds.length === 0) {
      return createPaginatedData([], 0, Number(page), Number(limit));
    }

    // 3. Build student filter for yearCode and search
    const studentWhere: any = {};
    if (yearCode) {
      studentWhere.code = { startsWith: yearCode };
    }
    if (search) {
      studentWhere.OR = [
        { thaiName: { contains: search, mode: 'insensitive' } },
        { engName: { contains: search, mode: 'insensitive' } },
        { code: { contains: search } },
      ];
    }
    // 4. Build the main query conditions
    const whereClause: any = {
      cloId: { in: cloIds },
      student: studentWhere,
    };

    if (targetLevel !== 'all') {
      // For non-'all' cases, we need to handle each CLO's expected level separately
      const orConditions = closData.map((clo) => {
        let levelCondition: any;
        if (targetLevel === 'on') {
          levelCondition = { equals: clo.expectSkillLevel };
        } else if (targetLevel === 'above') {
          levelCondition = { gt: clo.expectSkillLevel };
        } else if (targetLevel === 'below') {
          levelCondition = { lt: clo.expectSkillLevel };
        }

        return {
          AND: [{ cloId: clo.id }, { gainedLevel: levelCondition }],
        };
      });

      whereClause.OR = orConditions;
    }

    // 5. Get total count for pagination
    const total = await this.prisma.skill_collection.count({
      where: whereClause,
    });

    // 6. Get paginated results with students as main objects
    const results = await this.prisma.student.findMany({
      where: {
        id: {
          in: await this.prisma.skill_collection
            .findMany({
              where: whereClause,
              select: { studentId: true },
              distinct: ['studentId'],
            })
            .then((sc) => sc.map((s) => s.studentId)),
        },
      },
      include: {
        skill_collections: {
          where: whereClause,
          select: {
            studentId: true,
            gainedLevel: true,
            cloId: true,
          },
          // include: {
          //   clo: true,
          // },
        },
      },
      take: limit,
      skip: offset,
    });

    // map closData from first query to skill_collections
    const studentWithClo = results.map((student) => {
      const skillCollections = student.skill_collections.map((sc) => {
        const clo = closData.find((clo) => clo.id === sc.cloId);
        return {
          ...sc,
          clo,
        };
      });
      return {
        ...student,
        skill_collections: skillCollections,
      };
    });

    // 7. Return formatted response
    return createPaginatedData(
      studentWithClo,
      total,
      Number(page),
      Number(limit),
    );
  }

  private async findAllDescendants(
    rootSkillId: number,
  ): Promise<{ id: number }[]> {
    const result: { id: number }[] = [];
    const queue: number[] = [rootSkillId];
    const visited = new Set<number>();

    while (queue.length > 0) {
      const currentId = queue.shift();

      // Skip if already visited
      if (visited.has(currentId)) continue;

      visited.add(currentId);

      // Get the current skill
      const currentSkill = await this.prisma.skill.findUnique({
        where: { id: currentId },
        select: { id: true },
      });

      if (currentSkill) {
        result.push(currentSkill);

        // Find all direct children of the current skill
        const children = await this.prisma.skill.findMany({
          where: { parentId: currentId },
          select: { id: true },
        });

        // Add children to the queue for processing
        for (const child of children) {
          if (!visited.has(child.id)) {
            queue.push(child.id);
          }
        }
      }
    }

    return result;
  }

  async getSkillCollectionSummaryByCurriculum(
    curriculumId: number,
    studentName?: string,
    studentCode?: string,
    subjectName?: string,
  ) {
    // 1. ดึง student + skill_collections
    const students = await this.prisma.student.findMany({
      where: {
        curriculumId,
        thaiName: studentName ? { contains: studentName } : undefined,
        code: studentCode ? { startsWith: studentCode.slice(0, 2) } : undefined,
      },
      select: {
        id: true,
        code: true,
        thaiName: true,
        skill_collections: {
          select: {
            id: true,
            gainedLevel: true,
            clo: {
              select: {
                id: true,
                expectSkillLevel: true,
                skill: {
                  select: {
                    id: true,
                    thaiName: true,
                    domain: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // 2. เตรียมดึงเฉพาะ skill ที่มีใน subjectName (ถ้ามีระบุ)
    let skills: { id: number; thaiName: string; domain: string }[];

    if (subjectName) {
      // หา subject ที่ชื่อ match
      const matchedSubjects = await this.prisma.subject.findMany({
        where: {
          curriculumId,
          OR: [
            { thaiName: { contains: subjectName } },
            { engName: { contains: subjectName } },
          ],
        },
        select: {
          id: true,
          clos: {
            select: {
              skillId: true,
            },
          },
        },
      });

      // รวม skillId ที่มีใน CLO ของ subject เหล่านั้น
      const skillIds = [
        ...new Set(
          matchedSubjects
            .flatMap((subj) => subj.clos.map((clo) => clo.skillId))
            .filter((id): id is number => id !== null),
        ),
      ];

      // ดึง skill ตาม skillId ที่เจอ
      skills = await this.prisma.skill.findMany({
        where: {
          id: { in: skillIds },
        },
        select: {
          id: true,
          thaiName: true,
          domain: true,
        },
      });
    } else {
      // ดึง skill ทั้งหมดใน curriculum
      skills = await this.prisma.skill.findMany({
        where: { curriculumId },
        select: {
          id: true,
          thaiName: true,
          domain: true,
        },
      });
    }

    // 3. แยก skills ตาม domain และหา expectedLevel สำหรับแต่ละ skill
    const cognitivePsychomotorSkills = skills.filter(
      (skill) => skill.domain === 'ความรู้' || skill.domain === 'ทักษะ',
    );
    const affectiveEthicsSkills = skills.filter(
      (skill) =>
        skill.domain === 'คุณลักษณะบุคคล' || skill.domain === 'จริยธรรม',
    );

    // หา expectedLevel สำหรับแต่ละ skill เมื่อมี subjectName
    const getExpectedLevelForSkill = async (
      skillId: number,
    ): Promise<number | null> => {
      if (!subjectName) return null;

      // หา CLO ที่เกี่ยวข้องกับ skill นี้และ subject ที่เลือก
      const matchedSubjects = await this.prisma.subject.findMany({
        where: {
          curriculumId,
          OR: [
            { thaiName: { contains: subjectName } },
            { engName: { contains: subjectName } },
          ],
        },
        select: {
          id: true,
          clos: {
            where: { skillId },
            select: { expectSkillLevel: true },
          },
        },
      });

      // หา expectedLevel จาก CLO แรกที่เจอ
      for (const subject of matchedSubjects) {
        if (subject.clos.length > 0) {
          return subject.clos[0].expectSkillLevel;
        }
      }

      return null;
    };

    // 4. รวมข้อมูลผลลัพธ์
    const result = {
      curriculumId,
      students: [],
    };

    // ฟังก์ชันหาความถี่สูงสุด
    const getMostFrequentLevel = (levels: number[]): number | null => {
      if (levels.length === 0) return null;

      const frequency: { [key: number]: number } = {};
      levels.forEach((level) => {
        frequency[level] = (frequency[level] || 0) + 1;
      });

      let maxFreq = 0;
      let mostFrequent = levels[0];

      Object.entries(frequency).forEach(([level, freq]) => {
        if (freq > maxFreq) {
          maxFreq = freq;
          mostFrequent = parseInt(level);
        }
      });

      return mostFrequent;
    };

    const createSkillData = async (
      skillList: typeof skills,
      skillMap: Map<number, number[]>,
    ) => {
      const skillData = [];
      for (const sk of skillList) {
        const levels = skillMap.get(sk.id) || [];
        const gainedLevel = subjectName
          ? levels[0] || null
          : getMostFrequentLevel(levels);

        // หา expectedLevel จาก CLO เมื่อมี subjectName
        const expectedLevel = await getExpectedLevelForSkill(sk.id);

        skillData.push({
          skillId: sk.id,
          skillName: sk.thaiName,
          gainedLevel,
          expectedLevel,
        });
      }
      return skillData;
    };

    // ประมวลผลข้อมูลนักเรียนทีละคน
    for (const stu of students) {
      const skillMap = new Map<number, number[]>();

      // รวบรวม gainedLevel ทั้งหมดสำหรับแต่ละ skill
      for (const sc of stu.skill_collections) {
        const skill = sc.clo?.skill;
        if (skill) {
          if (!skillMap.has(skill.id)) {
            skillMap.set(skill.id, []);
          }
          skillMap.get(skill.id)?.push(sc.gainedLevel);
        }
      }

      const studentData = {
        studentId: stu.id,
        studentName: stu.thaiName,
        studentCode: stu.code,
        cognitivePsychomotorSkills: await createSkillData(
          cognitivePsychomotorSkills,
          skillMap,
        ),
        affectiveEthicsSkills: await createSkillData(
          affectiveEthicsSkills,
          skillMap,
        ),
      };

      result.students.push(studentData);
    }

    return result;
  }
}
