import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Adjust the import path as needed

import { PaginationDto } from 'src/dto/pagination.dto'; // Adjust the import path as needed
import { Prisma } from '@prisma/client'; // Import Prisma types
import { CreateFacultyDto } from 'src/generated/nestjs-dto/create-faculty.dto';
import { UpdateFacultyDto } from 'src/generated/nestjs-dto/update-faculty.dto';

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
          name: true,
          engName: true,
          branch: {
            select: {
              id: true,
              thaiName: true,
              engName: true,
            },
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch faculties');
    }
  }

  // Find all faculties with pagination and search
  async findAll(pag?: PaginationDto) {
    const defaultLimit = 10;
    const defaultPage = 1;

    const options: Prisma.facultyFindManyArgs = {
      include: { branch: true },
      where: {},
    };

    if (pag) {
      const { thaiName, engName, limit, page, orderBy: order } = pag;

      options.take = limit || defaultLimit;
      options.skip = ((page || defaultPage) - 1) * (limit || defaultLimit);
      options.orderBy = { id: order || 'asc' };

      options.where = {
        ...(thaiName && { thaiName: { contains: thaiName } }),
        ...(engName && { engName: { contains: engName } }),
      };

      try {
        const [faculties, total] = await Promise.all([
          this.prisma.faculty.findMany(options),
          this.prisma.faculty.count({ where: options.where }),
        ]);
        return { data: faculties, total };
      } catch (error) {
        console.error('Error fetching faculties:', error);
        throw new InternalServerErrorException('Failed to fetch faculties');
      }
    }

    // No pagination applied when pag is undefined
    try {
      return await this.prisma.faculty.findMany({ include: { branch: true } });
    } catch (error) {
      console.error('Error fetching faculties:', error);
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
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch faculty');
    }
  }

  // Update a faculty by ID
  async update(id: number, updateFacultyDto: UpdateFacultyDto) {
    try {
      const faculty = await this.prisma.faculty.update({
        where: { id },
        data: updateFacultyDto,
        include: { branch: true },
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
