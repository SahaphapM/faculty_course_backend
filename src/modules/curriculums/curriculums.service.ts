import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Adjust the import path as needed
import { Prisma } from '@prisma/client'; // Import Prisma types
import { CreateCurriculumDto } from 'src/generated/nestjs-dto/create-curriculum.dto';
import { PaginationDto } from 'src/dto/pagination.dto';
import { UpdateCurriculumDto } from 'src/generated/nestjs-dto/update-curriculum.dto';

@Injectable()
export class CurriculumsService {
  constructor(private prisma: PrismaService) {}

  // Create a new curriculum
  async create(dto: CreateCurriculumDto) {
    try {
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
    } catch (error) {
      throw new BadRequestException(
        'Failed to create curriculum',
        error.message,
      );
    }
  }

  // Find all curriculums with pagination and search
  async findAll(pag?: PaginationDto) {
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

    const options: Prisma.curriculumFindManyArgs = {
      take: limit || defaultLimit,
      skip: ((page || defaultPage) - 1) * (limit || defaultLimit),
      orderBy: { id: orderBy || 'asc' },
      include: {
        branch: {
          include: {
            faculty: true,
          },
        },
        skills: {
          include: {
            subs: true,
          },
        },
      },
      where: {
        ...(thaiName && { thaiName: { contains: thaiName } }),
        ...(engName && { engName: { contains: engName } }),
        ...(facultyThaiName && {
          branch: { faculty: { name: { contains: facultyThaiName } } },
        }),
        ...(facultyEngName && {
          branch: { faculty: { name: { contains: facultyEngName } } },
        }),
      },
    };

    try {
      if (pag) {
        const [curriculums, total] = await Promise.all([
          this.prisma.curriculum.findMany(options),
          this.prisma.curriculum.count({ where: options.where }),
        ]);
        return { data: curriculums, total };
      } else {
        return await this.prisma.curriculum.findMany(options);
      }
    } catch (error) {
      console.error('Error fetching curriculums:', error);
      throw new InternalServerErrorException('Failed to fetch curriculums');
    }
  }

  // Find a curriculum by ID
  async findOne(id: number) {
    try {
      const curriculum = await this.prisma.curriculum.findUnique({
        where: { id },
      });

      if (!curriculum) {
        throw new NotFoundException(`Curriculum with ID ${id} not found`);
      }

      return curriculum;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch curriculum');
    }
  }

  // Find a curriculum by code
  async findExistCode(code: string) {
    try {
      return await this.prisma.curriculum.findUnique({
        where: { code },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch curriculum by code',
      );
    }
  }

  // Find a curriculum by code with relations
  async findOneByCode(code: string) {
    try {
      const curriculum = await this.prisma.curriculum.findUnique({
        where: { code },
        include: {
          plos: true,
          subjects: {
            include: {
              clos: true,
            },
          },
          branch: true,
          coordinators: true,
          skills: {
            include: {
              subs: true,
            },
          },
        },
      });

      if (!curriculum) {
        throw new NotFoundException(`Curriculum with code ${code} not found`);
      }

      return curriculum;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch curriculum by code',
      );
    }
  }

  // Update a curriculum by ID
  async update(id: number, dto: UpdateCurriculumDto) {
    try {
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
      throw new BadRequestException('Failed to update curriculum');
    }
  }

  // Remove a curriculum by ID
  async remove(id: number): Promise<void> {
    try {
      await this.prisma.curriculum.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Curriculum with ID ${id} not found`);
      }
      throw new BadRequestException('Failed to remove curriculum');
    }
  }

  // Filter curriculums by branch ID
  async filters(branchId: string) {
    try {
      const curriculums = await this.prisma.curriculum.findMany({
        where: { branchId: parseInt(branchId) },
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
