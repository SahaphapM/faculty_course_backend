import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Adjust the import path as needed

import { Prisma } from '@prisma/client'; // Import Prisma types
import { CreateFacultyDto } from 'src/generated/nestjs-dto/create-faculty.dto';
import { UpdateFacultyDto } from 'src/generated/nestjs-dto/update-faculty.dto';
import { FacultyFilterDto } from 'src/dto/filters/filter.faculties.dto';
import { createPaginatedData } from 'src/utils/paginated.utils';
import { DefaultPaginaitonValue } from 'src/configs/pagination.configs';

@Injectable()
export class FacultiesService {
  constructor(private prisma: PrismaService) {}

  // Create a new faculty
  async create(createFacultyDto: CreateFacultyDto) {
    try {
      const faculty = await this.prisma.faculty.create({
        data: createFacultyDto,
      });
      return faculty;
    } catch (error) {
      throw new BadRequestException('Failed to create faculty', error.message);
    }
  }

  // Find all faculties with filters (e.g., branches)
  async findFilters() {
    try {
      return await this.prisma.faculty.findMany({
        select: {
          id: true,
          thaiName: true,
          engName: true,
          branch: {
            select: {
              id: true,
              thaiName: true,
              engName: true,
              curriculum: {
                select: {
                  id: true,
                  thaiName: true,
                  engName: true,
                },
              },
            },
          },
        },
      });
  } catch (_error) {
      throw new InternalServerErrorException('Failed to fetch faculties');
    }
  }

  // Find all faculties with pagination and search
  async findAll(pag?: FacultyFilterDto) {
  const defaultLimit = DefaultPaginaitonValue.limit;
  const defaultPage = DefaultPaginaitonValue.page;

    const options: Prisma.facultyFindManyArgs = {
      include: { branch: true },
      where: {},
    };

    if (pag) {
      const {
        thaiName,
        engName,
        limit,
        page,
        orderBy: order = DefaultPaginaitonValue.orderBy,
      } = pag;

      options.take = limit || defaultLimit;
      options.skip = ((page || defaultPage) - 1) * (limit || defaultLimit);
  options.orderBy = { id: (order as Prisma.SortOrder) || 'asc' };

      options.where = {
        ...(thaiName && { thaiName: { contains: thaiName } }),
        ...(engName && { engName: { contains: engName } }),
      };

      try {
  const [faculties, total] = await Promise.all([
          this.prisma.faculty.findMany(options),
          this.prisma.faculty.count({ where: options.where }),
        ]);
        return createPaginatedData(
          faculties,
          total,
          Number(page || defaultPage),
          Number(limit || defaultLimit),
        );
  } catch (_error) {
  console.error('Error fetching faculties:', _error);
        throw new InternalServerErrorException('Failed to fetch faculties');
      }
    }

    // No pagination applied when pag is undefined
    try {
      return await this.prisma.faculty.findMany({ include: { branch: true } });
  } catch (_error) {
  console.error('Error fetching faculties:', _error);
      throw new InternalServerErrorException('Failed to fetch faculties');
    }
  }

  // Find a faculty by ID
  async findOne(id: number) {
    try {
      const faculty = await this.prisma.faculty.findUnique({
        where: { id },
        include: { branch: true },
      });

      if (!faculty) {
        throw new NotFoundException(`Faculty with ID ${id} not found`);
      }

      return faculty;
  } catch (_error) {
      throw new InternalServerErrorException('Failed to fetch faculty');
    }
  }

  // Update a faculty by ID
  async update(id: number, updateFacultyDto: UpdateFacultyDto) {
    try {
      const faculty = await this.prisma.faculty.update({
        where: { id },
        data: updateFacultyDto,
      });
      return faculty;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Faculty with ID ${id} not found`);
      }
      throw new BadRequestException('Failed to update faculty');
    }
  }

  // Remove a faculty by ID
  async remove(id: number) {
    try {
      await this.prisma.faculty.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Faculty with ID ${id} not found`);
      }
      throw new BadRequestException('Failed to remove faculty');
    }
  }
}
