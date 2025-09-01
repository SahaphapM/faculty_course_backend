import {
  Injectable,
  NotFoundException,
  HttpStatus,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Adjust the import path as needed
import { Prisma } from '@prisma/client'; // Import Prisma types
import { CreateCurriculumDto } from 'src/generated/nestjs-dto/create-curriculum.dto';
import { UpdateCurriculumDto } from 'src/generated/nestjs-dto/update-curriculum.dto';
import { CurriculumFilterDto } from 'src/dto/filters/filter.curriculum.dto';
import { getSkillSummary } from './curriculums.helper';
import { CreateLevelDescriptionDto } from 'src/generated/nestjs-dto/create-levelDescription.dto';
import { createPaginatedData } from 'src/utils/paginated.utils';
import { SkillCollectionSummaryFilterDto } from 'src/dto/filters/filter.skill-collection.dto';
import { findStudentsTargetSkillLevel } from './curriculums.helper2';
import { LevelDescription } from 'src/generated/nestjs-dto/levelDescription.entity';
import { DefaultPaginaitonValue } from 'src/configs/pagination.configs';
import { AppErrorCode } from 'src/common/error-codes';

// types ช่วยอ่านง่ายขึ้น

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
        coordinators: coordinatorId
          ? {
              create: [
                {
                  coordinator: {
                    connect: { id: coordinatorId },
                  },
                },
              ],
            }
          : undefined,
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

  async updateLevelDescriptions(updates: Partial<LevelDescription>[]) {
    console.dir(updates, { depth: 3 });
    return Promise.all(
      updates.map((update) =>
        this.prisma.level_description.update({
          where: { id: update.id },
          data: { description: update.description },
        }),
      ),
    );
  }

  async getAllLevelDescription(curriculumCode: string) {
    const curriculum = await this.prisma.curriculum.findFirst({
      where: {
        code: curriculumCode,
        active: true,
      },
      select: {
        level_descriptions: true,
      },
    });

    if (!curriculum) {
      throw new NotFoundException(
        `Curriculum with code ${curriculumCode} not found`,
      );
    }

    return curriculum?.level_descriptions;
  }

  // Find all curriculums with pagination and search
  async findAll(pag?: CurriculumFilterDto) {
    const defaultLimit = DefaultPaginaitonValue.limit;
    const defaultPage = DefaultPaginaitonValue.page;

    const {
      limit,
      page,
      orderBy = DefaultPaginaitonValue.orderBy,
      sort = DefaultPaginaitonValue.sortBy,
      nameCode,
      degree,
      branchId,
      facultyId,
      coordinatorId,
    } = pag || {};

    const whereCondition: Prisma.curriculumWhereInput = {
      active: true, // Only show active curriculums
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
      ...(coordinatorId && {
        coordinators: { some: { coordinatorId: coordinatorId } },
      }),
    };

    const options: Prisma.curriculumFindManyArgs = {
      take: limit || defaultLimit,
      skip: ((page || defaultPage) - 1) * (limit || defaultLimit),
      orderBy: {
        [(sort === '' ? 'id' : sort) ?? 'id']:
          (orderBy as Prisma.SortOrder) ?? 'asc',
      },
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

    return createPaginatedData(curriculums, total, page, limit);
  }

  async findOptions() {
    const options = {
      where: {
        active: true, // Only return active curriculums
      },
      select: {
        id: true,
        code: true,
        thaiName: true,
        engName: true,
        thaiDegree: true,
        engDegree: true,
      },
    } as Prisma.curriculumFindManyArgs;
    return await this.prisma.curriculum.findMany(options);
  }

  // Find a curriculum by ID
  async findOne(id: number) {
    const curriculum = await this.prisma.curriculum.findFirst({
      where: {
        id,
        active: true, // Only return active curriculums
      },
      include: {
        coordinators: {
          include: {
            coordinator: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!curriculum) {
      throw new NotFoundException(`Curriculum with ID ${id} not found`);
    }

    return curriculum;
  }

  // Find a curriculum by code with relations
  async findOneByCode(code: string) {
    const curriculum = await this.prisma.curriculum.findFirst({
      where: {
        code,
        active: true, // Only return active curriculums
      },
      include: {
        branch: true,
        coordinators: {
          include: {
            coordinator: {
              include: {
                user: true,
              },
            },
          },
        },
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

  // Soft delete a curriculum by ID (set active to false)
  async remove(id: number): Promise<void> {
    try {
      const curriculum = await this.prisma.curriculum.findUnique({
        where: { id },
      });

      if (!curriculum) {
        throw new NotFoundException(`Curriculum with ID ${id} not found`);
      }

      if (!curriculum.active) {
        throw new BadRequestException(
          `Curriculum with ID ${id} is already deleted`,
        );
      }

      await this.prisma.curriculum.update({
        where: { id },
        data: { active: false },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Curriculum with ID ${id} not found`);
      }
      throw new BadRequestException(
        'Failed to delete curriculum: ' + error.message,
      );
    }
  }

  // Hard delete a curriculum by ID (with restriction checks)
  async hardDelete(id: number) {
    // 1) Check if curriculum exists
    const curriculum = await this.prisma.curriculum.findUnique({ where: { id } });
    if (!curriculum) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Curriculum not found',
      });
    }

    // 2) Check for PLOs that reference this curriculum (onDelete: Restrict)
    const ploCount = await this.prisma.plo.count({ where: { curriculumId: id } });

    if (ploCount > 0) {
      // Get the actual blocking PLOs with details
      const blockingPlos = await this.prisma.plo.findMany({
        where: { curriculumId: id },
        select: {
          id: true,
          name: true,
          type: true,
          thaiDescription: true,
          engDescription: true,
        },
        take: 10, // Limit to first 10 for performance
      });

      throw new ConflictException({
        code: AppErrorCode.FK_CONFLICT,
        message: `Cannot delete Curriculum "${curriculum.code} - ${curriculum.thaiName || curriculum.engName}" because there are PLOs referencing it.`,
        entity: 'Curriculum',
        entityName: `${curriculum.code} - ${curriculum.thaiName || curriculum.engName || `Curriculum #${id}`}`,
        id,
        blockers: [{ 
          relation: 'PLO', 
          count: ploCount, 
          field: 'curriculumId',
          entities: blockingPlos.map(plo => ({
            id: plo.id,
            name: plo.name || plo.type || `PLO #${plo.id}`,
            details: (plo.thaiDescription || plo.engDescription || '').substring(0, 100) + (plo.thaiDescription || plo.engDescription ? '...' : 'No description'),
          })),
        }],
        suggestions: [
          'Delete or reassign those PLOs to a different Curriculum.',
          'If business allows, detach PLOs first then delete Curriculum.',
          'Consider soft-delete/archiving instead of hard delete.',
        ],
      });
    }

    // 3) Safe to hard delete
    await this.prisma.curriculum.delete({ where: { id } });
    return { ok: true };
  }

  // Find all curriculums including inactive ones (admin only)
  async findAllIncludeInactive(pag?: CurriculumFilterDto) {
    const defaultLimit = DefaultPaginaitonValue.limit;
    const defaultPage = DefaultPaginaitonValue.page;

    const {
      limit,
      page,
      orderBy = DefaultPaginaitonValue.orderBy,
      sort = DefaultPaginaitonValue.sortBy,
      nameCode,
      degree,
      branchId,
      facultyId,
      coordinatorId,
    } = pag || {};

    const whereCondition: Prisma.curriculumWhereInput = {
      // No active filter - shows all curriculums including inactive ones
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
      ...(coordinatorId && {
        coordinators: { some: { coordinatorId: coordinatorId } },
      }),
    };

    const options: Prisma.curriculumFindManyArgs = {
      take: limit || defaultLimit,
      skip: ((page || defaultPage) - 1) * (limit || defaultLimit),
      orderBy: {
        [(sort === '' ? 'id' : sort) ?? 'id']:
          (orderBy as Prisma.SortOrder) ?? 'asc',
      },
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

    return createPaginatedData(curriculums, total, page, limit);
  }

  // Restore a soft-deleted curriculum (set active back to true)
  async restore(id: number): Promise<void> {
    try {
      const curriculum = await this.prisma.curriculum.findUnique({
        where: { id },
      });

      if (!curriculum) {
        throw new NotFoundException(`Curriculum with ID ${id} not found`);
      }

      if (curriculum.active) {
        throw new BadRequestException(
          `Curriculum with ID ${id} is not deleted`,
        );
      }

      await this.prisma.curriculum.update({
        where: { id },
        data: { active: true },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Curriculum with ID ${id} not found`);
      }
      throw new BadRequestException(
        'Failed to restore curriculum: ' + error.message,
      );
    }
  }

  // ---------- Service entry (พร้อมดีบักทางเลือก) ----------
  async getSkillSummaryByCurriculum(
    curriculumId: number,
    yearCode: string,
    skillType: string,
    _debug?: { studentId?: number; rootSkillId?: number }, // optional ดีบัก
  ): Promise<any> {
    return getSkillSummary(curriculumId, yearCode.slice(-2), skillType, {
      studentId: 4,
      rootSkillId: 2032,
    });
  }

  // async findStudentsBySkillLevel(
  //   skillId: number,
  //   targetLevel: 'on' | 'above' | 'below' | 'all',
  //   yearCode: string, // 68 69 70
  //   page: number = 1,
  //   limit: number = 10,
  //   search?: string,
  // ) {
  //   const take = Math.max(1, Number(limit) || 10);
  //   const currPage = Math.max(1, Number(page) || 1);
  //   const skip = (currPage - 1) * take;

  //   // ใช้กับทั้ง student.where และ include
  //   const assessmentWhere: Prisma.skill_assessmentWhereInput = {
  //     skillId: skillId, // ลูก ๆ ของ skill เป้าหมาย
  //   };

  //   // STEP 4: เงื่อนไข student (ปี/ค้นหา) + ต้องมี skill_assessments ตรง whereSC
  //   const studentWhere: Prisma.studentWhereInput = {
  //     ...(yearCode
  //       ? { code: { startsWith: yearCode } } // ปรับตามรูปแบบรหัสนักศึกษา
  //       : {}),
  //     ...(search
  //       ? {
  //           OR: [
  //             { thaiName: { contains: search } },
  //             { engName: { contains: search } },
  //             { code: { contains: search } },
  //           ],
  //         }
  //       : {}),
  //     // ต้องมีทั้ง skill_collections (ตาม targetLevel) และ skill_assessments (ตามเงื่อนไขที่กำหนด)
  //     AND: [{ skill_assessments: { some: assessmentWhere } }],
  //   };

  //   // STEP 5: นับ total และดึงหน้าที่ขอ
  //   const [total, students] = await this.prisma.$transaction([
  //     this.prisma.student.count({ where: studentWhere }),
  //     this.prisma.student.findMany({
  //       where: studentWhere,
  //       include: {
  //         skill_assessments: {
  //           where: assessmentWhere,
  //         },
  //       },
  //       orderBy: { id: 'asc' }, // ปรับได้ตามต้องการ
  //       skip,
  //       take,
  //     }),
  //   ]);

  //   // // STEP 6: ส่งกลับแบบแบ่งหน้า
  //   return createPaginatedData(students, total, currPage, take);
  // }

  // curriculums.service.ts

  async findStudentsBySkillLevel(
    skillId: number,
    targetLevel: 'on' | 'above' | 'below' | 'all',
    yearCode: string, // 2568 2569 2570
    page: number = 1,
    limit: number = 15,
    search?: string,
  ) {
    // // STEP 6: ส่งกลับแบบแบ่งหน้า
    return findStudentsTargetSkillLevel(
      skillId,
      targetLevel,
      yearCode.slice(-2),
      page,
      limit,
      search,
      {
        studentId: 4,
        rootSkillId: 2032,
      },
    );
  }

  async getSkillCollectionSummaryByCurriculumPaginated(
    curriculumId: number,
    pag: SkillCollectionSummaryFilterDto,
  ) {
    const defaultLimit = 10,
      defaultPage = 1;
    const {
      studentName,
      studentCode,
      subjectName,
      page,
      limit,
      sort,
      orderBy,
      type,
    } = pag;

    const _limit = Number(limit ?? defaultLimit);
    const _page = Number(page ?? defaultPage);
    const _skip = (_page - 1) * _limit;

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
    const { students, subjects, skills } = await this.prisma.$transaction(
      async (tx) => {
        const students = await tx.student.findMany({
          where: studentWhere,
          select: { id: true, code: true, thaiName: true },
          orderBy: {
            [(sort === '' ? 'id' : sort) ?? 'code']: (orderBy as any) ?? 'asc',
          },
          skip: _skip,
          take: _limit,
        });

        const total = await tx.student.count({ where: studentWhere });

        let subjects: {
          id: number;
          clos: { skillId: number | null; expectSkillLevel: number | null }[];
        }[] = [];
        if (subjectFilter) {
          subjects = await tx.subject.findMany({
            where: subjectFilter,
            select: {
              id: true,
              clos: { select: { skillId: true, expectSkillLevel: true } },
            },
          });
        }

        // ดึงรายการ skills
        let skills: { id: number; thaiName: string; domain: string }[];
        if (subjectFilter) {
          const subs = await tx.subject.findMany({
            where: subjectFilter,
            select: { clos: { select: { skillId: true } } },
          });
          const ids = [
            ...new Set(
              subs.flatMap((s) =>
                s.clos.map((c) => c.skillId).filter((x): x is number => !!x),
              ),
            ),
          ];
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
      },
    );

    // ---------- กรอง skill ตาม type ----------
    const isSoft = type === 'soft';
    const isHard = type === 'hard';
    const isSoftDomain = (d: string) =>
      d === 'คุณลักษณะบุคคล' || d === 'จริยธรรม';
    const isHardDomain = (d: string) => d === 'ความรู้' || d === 'ทักษะ';

    let filteredSkills = skills;
    if (isSoft) filteredSkills = skills.filter((s) => isSoftDomain(s.domain));
    if (isHard) filteredSkills = skills.filter((s) => isHardDomain(s.domain));

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
    const studentIds = students.map((s) => s.id);
    const skillIds = filteredSkills.map((s) => s.id);

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
      let ans = arr[0],
        mx = 0;
      for (const [k, v] of Object.entries(freq))
        if (v > mx) {
          mx = v;
          ans = +k;
        }
      return ans;
    };

    const buildSkillData = (
      list: typeof filteredSkills,
      m?: Map<number, number[]>,
    ) =>
      list.map((sk) => {
        const levels = m?.get(sk.id) ?? [];
        const gainedLevel = subjectName
          ? (levels[0] ?? null)
          : mostFrequent(levels);
        const expectedLevel = subjectName
          ? (expectedLevelMap.get(sk.id) ?? null)
          : null;
        return {
          skillId: sk.id,
          skillName: sk.thaiName,
          domain: sk.domain,
          gainedLevel,
          expectedLevel,
        };
      });

    // สร้างผลลัพธ์ (เลือกส่งเฉพาะกลุ่มตาม type)
    const data = students.map((stu) => {
      const m = byStudent.get(stu.id);

      // ถ้าอยากแยกกล่อง soft/hard ใน output เสมอ
      const softSkills = filteredSkills.filter((s) => isSoftDomain(s.domain));
      const hardSkills = filteredSkills.filter((s) => isHardDomain(s.domain));

      return {
        studentId: stu.id,
        studentName: stu.thaiName,
        studentCode: stu.code,
        hardSkills: buildSkillData(hardSkills, m), // ความรู้/ทักษะ
        softSkills: buildSkillData(softSkills, m), // คุณลักษณะบุคคล/จริยธรรม
      };
    });

    return createPaginatedData(
      data,
      students.length
        ? await this.prisma.student.count({ where: studentWhere })
        : 0,
      _page,
      _limit,
    );
  }
}
