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
import {
  fetchSkillsWithCollections,
  generateSkillSummary,
  getSkillDomains,
  getStudentIds,
} from './curriculums.helper';

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
    yearCode: string,
    skillType: string,
  ) {
    // 1. Determine domains based on skill type
    const domains = getSkillDomains(skillType);

    // 2. Get student IDs for the given curriculum and year
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
      },
    });
    const cloIds = closData.map((clo) => clo.id);

    if (cloIds.length === 0) {
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
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
    return {
      data: studentWithClo,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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
}
