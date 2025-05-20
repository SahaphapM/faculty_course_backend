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
    //  กำหนดประเภทของ skill ที่จะดึง
    let domain = [LearningDomain.Cognitive, LearningDomain.Psychomotor];
    if (skillType === 'soft') {
      domain = [LearningDomain.Affective, LearningDomain.Ethics];
    }

    //  หานิสิตในหลักสูตร และปีนั้น ๆ (จากรหัสนิสิต เช่น 68160001 = ปี 1 ใน 2568)
    const currentYear = new Date().getFullYear(); // 2025
    const currentAcademicYear = currentYear + 543; // 2568

    const prefix = year
      ? String(currentAcademicYear - year + 1).slice(-2) // ปี 1 → "68"
      : undefined;

    const students = await this.prisma.student.findMany({
      where: {
        curriculumId,
        ...(prefix && {
          code: { startsWith: prefix }, // รหัสนิสิตขึ้นต้นด้วย "68" = ปี 1
        }),
      },
      select: { id: true },
    });

    const studentIds = students.map((s) => s.id);

    //  ดึงข้อมูล skill ทั้งหมดใน curriculum พร้อม CLO และระดับที่นิสิตได้ (gainedLevel)
    const skills = await this.prisma.skill.findMany({
      where: {
        curriculumId,
        ...(domain?.length ? { domain: { in: domain } } : {}),
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

    //  สรุปข้อมูล skill ทีละตัว
    const result = [];

    for (const skill of skills) {
      // 👉 levelCounts คือ object ที่เก็บว่า gainedLevel แต่ละค่ามีคนได้กี่คน
      // เช่น { 1: 5, 2: 10, 3: 15 }
      const levelCounts: Record<number, number> = {};
      // 👉 Record<number, number> = object ที่ key เป็นตัวเลข (level), value เป็นจำนวนคน

      const levelSummary: { level: number; count: number; category: string }[] =
        [];
      let total = 0;

      // 👉 ใช้เก็บ target range
      let onTargetMin: number | null = null;
      let onTargetMax: number | null = null;
      let aboveTargetMin: number | null = null;

      for (const clo of skill.clos) {
        // หา min/max ของระดับเป้าหมายจาก CLO ที่เชื่อมกับ skill นี้
        if (clo.onTargetLevel != null) {
          onTargetMin =
            onTargetMin === null
              ? clo.onTargetLevel
              : Math.min(onTargetMin, clo.onTargetLevel);
        }
        if (clo.aboveTargetLevel != null) {
          aboveTargetMin =
            aboveTargetMin === null
              ? clo.aboveTargetLevel
              : Math.min(aboveTargetMin, clo.aboveTargetLevel);
        }
        if (clo.onTargetLevel != null && clo.aboveTargetLevel != null) {
          onTargetMax =
            onTargetMax === null
              ? clo.aboveTargetLevel - 1
              : Math.max(onTargetMax, clo.aboveTargetLevel - 1);
        }

        // ✨ รวมจำนวน gainedLevel ของนิสิต
        for (const col of clo.skill_collections) {
          const level = col.gainedLevel;
          if (level == null) continue;

          total++;
          levelCounts[level] = (levelCounts[level] || 0) + 1;
        }
      }

      // 🧩 ฟังก์ชันจำแนกว่า level นั้นอยู่ช่วงใด
      const classify = (level: number): string => {
        if (aboveTargetMin != null && level >= aboveTargetMin) return 'above';
        if (
          onTargetMin != null &&
          onTargetMax != null &&
          level >= onTargetMin &&
          level <= onTargetMax
        )
          return 'on';
        return 'below';
      };

      // 🔄 แปลง object levelCounts เป็น array levelSummary
      for (const [levelStr, count] of Object.entries(levelCounts)) {
        const level = Number(levelStr);
        levelSummary.push({ level, count, category: classify(level) });
      }

      // 🎯 เพิ่มผลลัพธ์ของ skill นี้ใน array
      result.push({
        skillName: skill.thaiName,
        domain: skill.domain,
        totalStudent: total,
        levelSummary,
      });
    }

    return result;
  }
}
