import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Adjust the import path as needed

import { Prisma } from '@prisma/client'; // Import Prisma types
import { CreateFacultyDto } from 'src/generated/nestjs-dto/create-faculty.dto';
import { UpdateFacultyDto } from 'src/generated/nestjs-dto/update-faculty.dto';
import { FacultyFilterDto } from 'src/dto/filters/filter.faculties.dto';
import { createPaginatedData } from 'src/utils/paginated.utils';
import { DefaultPaginaitonValue } from 'src/configs/pagination.configs';
import { AppErrorCode } from 'src/common/error-codes';

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
      options.orderBy = { id: (order as Prisma.SortOrder) || 'desc' };

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
      return await this.prisma.faculty.findMany({
        include: { branch: true },
        orderBy: { id: 'desc' },
      });
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
    // 1) Check if faculty exists
    const faculty = await this.prisma.faculty.findUnique({ where: { id } });
    if (!faculty) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Faculty not found',
      });
    }

    // 2) Check for branches that reference this faculty (onDelete: Restrict)
    const branchCount = await this.prisma.branch.count({
      where: { facultyId: id },
    });

    if (branchCount > 0) {
      // Get the actual blocking branches with details
      const blockingBranches = await this.prisma.branch.findMany({
        where: { facultyId: id },
        select: {
          id: true,
          thaiName: true,
          engName: true,
          abbrev: true,
        },
        take: 10, // Limit to first 10 for performance
      });

      throw new ConflictException({
        code: AppErrorCode.FK_CONFLICT,
        message: `Cannot delete Faculty "${faculty.thaiName || faculty.engName}" because there are Branches referencing it.`,
        entity: 'Faculty',
        entityName: faculty.thaiName || faculty.engName || `Faculty #${id}`,
        id,
        blockers: [
          {
            relation: 'Branch',
            count: branchCount,
            field: 'facultyId',
            entities: blockingBranches.map((branch) => ({
              id: branch.id,
              name: branch.thaiName || branch.engName || `Branch #${branch.id}`,
              details: branch.abbrev ? `(${branch.abbrev})` : '',
            })),
          },
        ],
        suggestions: [
          'Delete or reassign those Branches to a different Faculty.',
          'If business allows, detach Branches first (set facultyId = null) then delete Faculty.',
          'Consider soft-delete/archiving instead of hard delete.',
        ],
      });
    }

    // 3) Safe to delete
    await this.prisma.faculty.delete({ where: { id } });
    return { ok: true };
  }
}
