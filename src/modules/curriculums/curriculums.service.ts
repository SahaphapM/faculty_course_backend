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
import { Student } from 'src/generated/nestjs-dto/student.entity';

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
    yearCode: string, // รหัสปีการศึกษา
    skillType: string, // soft or hard
  ) {
    // 🔷 1) กำหนด domain ของ skill
    let domain = [LearningDomain.Cognitive, LearningDomain.Psychomotor];
    if (skillType === 'soft') {
      domain = [LearningDomain.Affective, LearningDomain.Ethics];
    }

    // 🔷 3) ดึง studentIds
    const students = await this.prisma.student.findMany({
      where: {
        curriculumId,
        ...(yearCode && {
          code: { startsWith: yearCode },
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
      const studentCategories = new Map<number, 'above' | 'on' | 'below'>();
      const expectedLevels = new Set<number>();

      // 🔷 หา leaf skill ทั้งหมดของ root (รวมถึง root เองถ้าไม่มี children)
      let leafSkills = findAllDescendants(root.id);
      if (leafSkills.length === 0) {
        // Root skill itself is a leaf skill
        leafSkills = [root];
      }

      // First pass: Collect all expected levels and initialize student categories
      for (const leaf of leafSkills) {
        for (const clo of leaf.clos) {
          if (clo.expectSkillLevel != null) {
            expectedLevels.add(clo.expectSkillLevel);
          }
        }
      }

      // If no expected levels, skip this root skill
      if (expectedLevels.size === 0) continue;

      // Second pass: Categorize students
      for (const leaf of leafSkills) {
        for (const clo of leaf.clos) {
          if (clo.expectSkillLevel == null) continue;

          for (const col of clo.skill_collections) {
            const level = col.gainedLevel;
            if (level == null || col.studentId == null) continue;

            // Determine category for this student's level
            let category: 'above' | 'on' | 'below';
            if (level > clo.expectSkillLevel) {
              category = 'above';
            } else if (level === clo.expectSkillLevel) {
              category = 'on';
            } else {
              category = 'below';
            }

            // Update student's category (keep the worst case)
            const currentCategory = studentCategories.get(col.studentId);
            if (
              !currentCategory ||
              category === 'below' ||
              (currentCategory === 'on' && category === 'above')
            ) {
              studentCategories.set(col.studentId, category);
            }
          }
        }
      }

      // Count students in each category
      const categoryCounts = {
        above: 0,
        on: 0,
        below: 0,
      };

      const categorizedStudents = {
        above: [],
        on: [],
        below: [],
      };

      // Group students by category
      for (const [studentId, category] of studentCategories.entries()) {
        categoryCounts[category]++;
        categorizedStudents[category].push(studentId);
      }

      // Prepare level summary (now just categories)
      const levelSummary = [
        {
          category: 'above',
          count: categoryCounts.above,
          studentIds: categorizedStudents.above,
        },
        {
          category: 'on',
          count: categoryCounts.on,
          studentIds: categorizedStudents.on,
        },
        {
          category: 'below',
          count: categoryCounts.below,
          studentIds: categorizedStudents.below,
        },
      ].filter((item) => item.count > 0);

      // Add root skill to results
      result.push({
        skillName: root.thaiName,
        domain: root.domain,
        totalStudent: studentCategories.size,
        levelSummary,
      });
    }

    return result;
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

  async findStudentsBySkillLevel(
    skillId: number,
    targetLevel: 'on' | 'above' | 'below' | 'all',
    yearCode: string, // 68 69 70
    page: number,
    limit: number,
    search?: string,
  ): Promise<[Student[], number]> {
    const offset = (page - 1) * limit;

    // 1. Find all descendant skills (including the root skill itself)
    const allSkills = await this.findAllDescendants(skillId);
    const skillIds = allSkills.map((skill) => skill.id);

    console.log('allSkills', allSkills);

    // 2. Find all CLOs related to these skills
    const clos = await this.prisma.clo.findMany({
      where: {
        skillId: { in: skillIds },
      },
      select: {
        id: true,
        expectSkillLevel: true,
      },
    });
    const cloIds = clos.map((clo) => clo.id);

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
    // 4. Find all studentIds that match the targetLevel condition
    const studentIdSet = new Set<number>();
    if (targetLevel === 'all') {
      // For 'all', no need to filter by gainedLevel vs expectSkillLevel
      const skillCollections = await this.prisma.skill_collection.findMany({
        where: {
          cloId: { in: cloIds },
          student: studentWhere,
        },
        select: { studentId: true },
      });
      skillCollections.forEach((sc) => studentIdSet.add(sc.studentId));
    } else {
      // For each CLO, filter skill_collections based on its expectSkillLevel
      const scPromises = clos.map((clo) => {
        let condition: any;
        if (targetLevel === 'on') {
          condition = { equals: clo.expectSkillLevel };
        } else if (targetLevel === 'above') {
          condition = { gt: clo.expectSkillLevel };
        } else if (targetLevel === 'below') {
          condition = { lt: clo.expectSkillLevel };
        }

        return this.prisma.skill_collection.findMany({
          where: {
            cloId: clo.id,
            gainedLevel: condition,
            student: studentWhere,
          },
          select: { studentId: true },
        });
      });

      const scResults = await Promise.all(scPromises);
      scResults.forEach((scs) =>
        scs.forEach((sc) => studentIdSet.add(sc.studentId)),
      );
    }

    const studentIds = Array.from(studentIdSet);
    const totalCount = studentIds.length;

    // 5. Fetch paginated students with their skill_collections
    const students = await this.prisma.student.findMany({
      where: {
        id: { in: studentIds },
      },
      include: {
        skill_collections: {
          where: { cloId: { in: cloIds } },
          include: { clo: { include: { skill: true } } },
        },
      },
      orderBy: { code: 'asc' },
      skip: offset,
      take: limit,
    });

    return [students as Student[], totalCount];
  }
}
