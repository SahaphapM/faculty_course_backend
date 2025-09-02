import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CurriculumFilterDto } from 'src/dto/filters/filter.curriculum.dto';
import { createPaginatedData } from 'src/utils/paginated.utils';
import { Prisma } from '@prisma/client';
import { DefaultPaginaitonValue } from 'src/configs/pagination.configs';

@Injectable()
export class CoordinatorCurriculumsService {
  constructor(private prisma: PrismaService) {}

  // Find all curriculums for a specific coordinator
  async findAllForCoordinator(coordinatorUserId: number, pag?: CurriculumFilterDto) {
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
      active,
    } = pag || {};

    const whereCondition: Prisma.curriculumWhereInput = {
      ...(active !== undefined ? { active } : { active: true }), // Default to active=true if no active filter provided
      coordinators: {
        some: {
          coordinator: {
            user: {
              id: coordinatorUserId,
            },
          },
        },
      },
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

  // Find curriculum options for a specific coordinator
  async findOptionsForCoordinator(coordinatorUserId: number) {
    const options = {
      where: {
        active: true,
        coordinators: {
          some: {
            coordinator: {
              user: {
                id: coordinatorUserId,
              },
            },
          },
        },
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
}
