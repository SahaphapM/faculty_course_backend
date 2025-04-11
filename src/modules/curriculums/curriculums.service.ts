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
import { FilterParams } from 'src/dto/filter-params.dto';
import { UpdateCurriculumDto } from 'src/generated/nestjs-dto/update-curriculum.dto';

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
  async findAll(pag?: FilterParams) {
    const defaultLimit = 15;
    const defaultPage = 1;

    const {
      limit,
      page,
      orderBy,
      thaiName,
      engName,
      facultyThaiName,
      facultyEngName,
    } = pag || {};

    const whereCondition: Prisma.curriculumWhereInput = {
      ...(thaiName && { thaiName: { contains: thaiName } }),
      ...(engName && { engName: { contains: engName } }),
      ...(facultyThaiName && {
        branch: { faculty: { thaiName: { contains: facultyThaiName } } },
      }),
      ...(facultyEngName && {
        branch: { faculty: { engName: { contains: facultyEngName } } },
      }),
    };

    const includeCondition: Prisma.curriculumInclude = {
      branch: {
        include: {
          faculty: true,
        },
      },
    };

    if (!pag) {
      // No pagination → fetch everything without limits
      return this.prisma.curriculum.findMany({
        where: whereCondition,
        include: includeCondition,
        orderBy: { id: 'asc' }, // Default ordering
      });
    }

    // With pagination
    const options: Prisma.curriculumFindManyArgs = {
      take: limit || defaultLimit,
      skip: ((page || defaultPage) - 1) * (limit || defaultLimit),
      orderBy: { id: orderBy || 'asc' },
      include: includeCondition,
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
}
