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
import { SkillCollectionSummaryFilterDto } from 'src/dto/filters/filter.skill-collection-summary.dto';

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
        coordinators: coordinatorId ? {
          create: [{
            instructor: {
              connect: { id: coordinatorId }
            }
          }]
        } : undefined,
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
      ...(coordinatorId && { coordinators: { some: { instructorId: coordinatorId } } }),
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
        { thaiName: { contains: search } },
        { engName: { contains: search } },
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

  // สมมติว่ามี helper ชื่อ createPaginatedData แบบเดียวกับตัวอย่าง findAll()

// curriculums.service.ts
async getSkillCollectionSummaryByCurriculumPaginated(
  curriculumId: number,
  pag: SkillCollectionSummaryFilterDto
) {
  const defaultLimit = 10, defaultPage = 1;
  const { studentName, studentCode, subjectName, page, limit, sort, orderBy, type } = pag;

  const _limit = Number(limit ?? defaultLimit);
  const _page  = Number(page ?? defaultPage);
  const _skip  = (_page - 1) * _limit;

  const codePrefix = studentCode ? studentCode.slice(0, 2) : undefined;
  // Fetch curriculumId by curriculumCode

  const studentWhere: Prisma.studentWhereInput = {
    curriculumId: curriculumId,
    thaiName: studentName ? { contains: studentName } : undefined,
    code: codePrefix ? { startsWith: codePrefix } : undefined,
  };

  const subjectFilter = subjectName
    ? {
        curriculumId,
        OR: [
          { thaiName: { contains: subjectName } },
          { engName: { contains: subjectName } },
        ],
      }
    : undefined;

  // ---------- ดึงพื้นฐานใน transaction ----------
  const { students,  subjects, skills } = await this.prisma.$transaction(async (tx) => {
    const students = await tx.student.findMany({
      where: studentWhere,
      select: { id: true, code: true, thaiName: true },
      orderBy: { [(sort === '' ? 'id' : sort) ?? 'code']: (orderBy as any) ?? 'asc' },
      skip: _skip,
      take: _limit,
    });

    const total = await tx.student.count({ where: studentWhere });

    let subjects: { id: number; clos: { skillId: number|null; expectSkillLevel: number|null }[] }[] = [];
    if (subjectFilter) {
      subjects = await tx.subject.findMany({
        where: subjectFilter,
        select: { id: true, clos: { select: { skillId: true, expectSkillLevel: true } } },
      });
    }

    // ดึงรายการ skills
    let skills: { id: number; thaiName: string; domain: string }[];
    if (subjectFilter) {
      const subs = await tx.subject.findMany({
        where: subjectFilter,
        select: { clos: { select: { skillId: true } } },
      });
      const ids = [...new Set(subs.flatMap(s => s.clos.map(c => c.skillId).filter((x): x is number => !!x)))];
      skills = await tx.skill.findMany({
        where: { id: { in: ids.length ? ids : [-1] } },
        select: { id: true, thaiName: true, domain: true },
      });
    } else {
      skills = await tx.skill.findMany({
        where: { curriculumId: curriculumId },
        select: { id: true, thaiName: true, domain: true },
      });
    }

    return { students, total, subjects, skills };
  });

  // ---------- กรอง skill ตาม type ----------
  const isSoft = type === 'soft';
  const isHard = type === 'hard';
  const isSoftDomain = (d: string) => d === 'คุณลักษณะบุคคล' || d === 'จริยธรรม';
  const isHardDomain = (d: string) => d === 'ความรู้' || d === 'ทักษะ';

  let filteredSkills = skills;
  if (isSoft) filteredSkills = skills.filter(s => isSoftDomain(s.domain));
  if (isHard) filteredSkills = skills.filter(s => isHardDomain(s.domain));

  // map expectedLevel ต่อ skill (กรณีมี subjectName)
  const expectedLevelMap = new Map<number, number | null>();
  if (subjects.length) {
    for (const subj of subjects) {
      for (const clo of subj.clos) {
        if (clo.skillId != null && !expectedLevelMap.has(clo.skillId)) {
          expectedLevelMap.set(clo.skillId, clo.expectSkillLevel ?? null);
        }
      }
    }
  }

  // ดึง skill_collections สำหรับ “นักเรียนในหน้านี้” + “สกิลที่กรองแล้ว”
  const studentIds = students.map(s => s.id);
  const skillIds   = filteredSkills.map(s => s.id);

  const scWhere: Prisma.skill_collectionWhereInput = {
    studentId: { in: studentIds.length ? studentIds : [-1] },
    clo: {
      skillId: { in: skillIds.length ? skillIds : undefined },
      ...(subjectFilter ? { subject: subjectFilter as any } : {}),
    },
  };

  const scRows = await this.prisma.skill_collection.findMany({
    where: scWhere,
    select: {
      studentId: true,
      gainedLevel: true,
      clo: { select: { skillId: true } },
    },
  });

  // group: studentId -> (skillId -> [gainedLevel...])
  const byStudent = new Map<number, Map<number, number[]>>();
  for (const r of scRows) {
    const sid = r.studentId!;
    const skid = r.clo?.skillId;
    if (!sid || !skid) continue;
    if (!byStudent.has(sid)) byStudent.set(sid, new Map());
    const m = byStudent.get(sid)!;
    if (!m.has(skid)) m.set(skid, []);
    m.get(skid)!.push(r.gainedLevel);
  }

  const mostFrequent = (arr: number[]) => {
    if (!arr?.length) return null;
    const freq: Record<number, number> = {};
    for (const v of arr) freq[v] = (freq[v] || 0) + 1;
    let ans = arr[0], mx = 0;
    for (const [k, v] of Object.entries(freq)) if (v > mx) { mx = v; ans = +k; }
    return ans;
  };

  const buildSkillData = (list: typeof filteredSkills, m?: Map<number, number[]>) =>
    list.map(sk => {
      const levels = m?.get(sk.id) ?? [];
      const gainedLevel = subjectName ? (levels[0] ?? null) : mostFrequent(levels);
      const expectedLevel = subjectName ? (expectedLevelMap.get(sk.id) ?? null) : null;
      return { skillId: sk.id, skillName: sk.thaiName, domain: sk.domain, gainedLevel, expectedLevel };
    });

  // สร้างผลลัพธ์ (เลือกส่งเฉพาะกลุ่มตาม type)
  const data = students.map(stu => {
    const m = byStudent.get(stu.id);

    // ถ้าอยากแยกกล่อง soft/hard ใน output เสมอ
    const softSkills = filteredSkills.filter(s => isSoftDomain(s.domain));
    const hardSkills = filteredSkills.filter(s => isHardDomain(s.domain));

    return {
      studentId: stu.id,
      studentName: stu.thaiName,
      studentCode: stu.code,
      hardSkills: buildSkillData(hardSkills, m), // ความรู้/ทักษะ
      softSkills: buildSkillData(softSkills, m), // คุณลักษณะบุคคล/จริยธรรม
    };
  });

  return createPaginatedData(data, students.length ? (await this.prisma.student.count({ where: studentWhere })) : 0, _page, _limit);
}


}
