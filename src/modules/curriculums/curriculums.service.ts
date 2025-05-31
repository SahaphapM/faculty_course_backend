import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Adjust the import path as needed
import { Prisma } from '@prisma/client'; // Import Prisma types
import { CreateCurriculumDto } from 'src/generated/nestjs-dto/create-curriculum.dto';
import { UpdateCurriculumDto } from 'src/generated/nestjs-dto/update-curriculum.dto';
import { CurriculumFilterDto } from 'src/dto/filters/filter.curriculum.dto';
import { LearningDomain } from 'src/enums/learning-domain.enum';

@Injectable()
export class CurriculumsService {
  constructor(private prisma: PrismaService) {}

  // Create a new curriculum
  async create(dto: CreateCurriculumDto) {
    const { branchId, ...rest } = dto;

    const curriculum = await this.prisma.curriculum.create({
      data: {
        ...rest,
        branch: branchId ? { connect: { id: branchId } } : undefined,
      },
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Curriculum created successfully',
      data: curriculum,
    };
  }

  // Find all curriculums with pagination and search
  async findAll(pag?: CurriculumFilterDto) {
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
    };

    // With pagination
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
    return { data: curriculums, total };
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
      // throw new NotFoundException(`Curriculum with code ${code} not found`);
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: `Curriculum with code ${code} not found`,
      };
    }

    return curriculum;
  }

  async update(id: number, dto: UpdateCurriculumDto) {
    try {
      // ดึงของเก่ามา
      const old = await this.prisma.curriculum.findUnique({ where: { id } });
      if (!old) {
        throw new NotFoundException(`Curriculum with ID ${id} not found`);
      }

      // ถ้า code เปลี่ยน → ตรวจสอบว่าไม่ชน
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

      // ทำการอัปเดต
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

  // Filter curriculums by branch ID
  async findWithFilters(branchId: number) {
    try {
      const curriculums = await this.prisma.curriculum.findMany({
        where: { branchId: branchId },
        select: {
          id: true,
          thaiName: true,
          engName: true,
        },
      });
      return curriculums;
    } catch (error) {
      throw new InternalServerErrorException('Failed to filter curriculums');
    }
  }

  async getSkillSummaryByCurriculum(
    curriculumId: number,
    year?: number,
    skillType?: string,
  ) {
    // 🔷 1) กำหนด domain ของ skill
    let domain = [LearningDomain.Cognitive, LearningDomain.Psychomotor];
    if (skillType === 'soft') {
      domain = [LearningDomain.Affective, LearningDomain.Ethics];
    }

    // 🔷 2) คำนวณ prefix สำหรับกรอง student (เช่น "68" สำหรับปี 1 ของ 2568)
    const currentYear = new Date().getFullYear();
    const currentAcademicYear = currentYear + 543;
    const prefix = year
      ? String(currentAcademicYear - year + 1).slice(-2)
      : undefined;

    // 🔷 3) ดึง studentIds
    const students = await this.prisma.student.findMany({
      where: {
        curriculumId,
        ...(prefix && {
          code: { startsWith: prefix },
        }),
      },
      select: { id: true },
    });
    const studentIds = students.map((s) => s.id);
    console.log('totalStudent', studentIds.length);

    // 🔷 4) ดึง skill ทั้งหมด (พร้อม clo, skill_collections)
    const skills = await this.prisma.skill.findMany({
      where: {
        curriculumId,
        ...(domain.length ? { domain: { in: domain } } : {}),
      },
      include: {
        clos: {
          include: {
            skill_collections: {
              where: { studentId: { in: studentIds } },
              select: {
                studentId: true,
                gainedLevel: true,
              },
            },
          },
        },
      },
    });

    console.log('totalSkills', skills.length);

    // 🔷 5) Helper function to find all descendant skills (leaf skills) of a root skill
    const findAllDescendants = (rootSkillId: number): any[] => {
      const descendants = [];
      const directChildren = skills.filter((s) => s.parentId === rootSkillId);

      for (const child of directChildren) {
        const childDescendants = findAllDescendants(child.id);
        if (childDescendants.length === 0) {
          // This is a leaf skill (no children)
          descendants.push(child);
        } else {
          // This skill has children, so include its descendants
          descendants.push(...childDescendants);
        }
      }

      return descendants;
    };

    // 🔷 6) สรุปเฉพาะ root skill (parentId === null)
    const rootSkills = skills.filter((s) => s.parentId === null);
    const result = [];

    for (const root of rootSkills) {
      const expectedLevels: number[] = [];
      const studentMaxLevels = new Map<number, number>(); // studentId -> max gainedLevel

      // 🔷 หา leaf skill ทั้งหมดของ root (รวมถึง root เองถ้าไม่มี children)
      let leafSkills = findAllDescendants(root.id);
      if (leafSkills.length === 0) {
        // Root skill itself is a leaf skill
        leafSkills = [root];
      }

      for (const leaf of leafSkills) {
        for (const clo of leaf.clos) {
          if (clo.expectSkillLevel != null) {
            expectedLevels.push(clo.expectSkillLevel);
          }

          for (const col of clo.skill_collections) {
            const level = col.gainedLevel;
            if (level == null || col.studentId == null) continue;

            // Track the maximum level per student for this root skill
            const currentMax = studentMaxLevels.get(col.studentId) || 0;
            studentMaxLevels.set(col.studentId, Math.max(currentMax, level));
          }
        }
      }

      // 🔷 ถ้าไม่มี expectedLevel → ให้เป็น 0
      const expectedLevelRoot =
        expectedLevels.length > 0
          ? Math.round(
              expectedLevels.reduce((a, b) => a + b, 0) / expectedLevels.length,
            )
          : 0;

      // 🔷 ฟังก์ชันจำแนกช่วงของ level
      const classify = (level: number): string => {
        if (level > expectedLevelRoot) return 'above';
        if (level === expectedLevelRoot) return 'on';
        return 'below';
      };

      // 🔷 นับจำนวนนักเรียนในแต่ละ level (แต่ละคนนับครั้งเดียวตาม max level)
      const levelCounts: Record<number, number> = {};
      for (const maxLevel of studentMaxLevels.values()) {
        levelCounts[maxLevel] = (levelCounts[maxLevel] || 0) + 1;
      }

      // 🔷 สร้าง levelSummary
      const levelSummary: { level: number; count: number; category: string }[] =
        [];
      for (const [levelStr, count] of Object.entries(levelCounts)) {
        const level = Number(levelStr);
        levelSummary.push({
          level,
          count,
          category: classify(level),
        });
      }

      // 🔷 เพิ่มข้อมูล root skill ในผลลัพธ์
      result.push({
        skillName: root.thaiName,
        domain: root.domain,
        totalStudent: studentMaxLevels.size, // Count unique students
        expectedLevel: expectedLevelRoot,
        levelSummary,
      });
    }

    return result;
  }
}
