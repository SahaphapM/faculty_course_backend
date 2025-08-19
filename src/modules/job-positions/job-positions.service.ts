import { Injectable, ConflictException } from '@nestjs/common';
import { CreateJobPositionDto } from 'src/generated/nestjs-dto/create-jobPosition.dto';
import { UpdateJobPositionDto } from 'src/generated/nestjs-dto/update-jobPosition.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  BaseFilterParams,
} from 'src/dto/filters/filter.base.dto';
import { createPaginatedData } from 'src/utils/paginated.utils';
import { DefaultPaginaitonValue } from 'src/configs/pagination.configs';

@Injectable()
export class JobPositionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createJobPositionDto: CreateJobPositionDto) {
    // Check if job position with the same name already exists
    const existingJobPosition = await this.prisma.job_position.findFirst({
      where: { name: createJobPositionDto.name },
    });

    if (existingJobPosition) {
      throw new ConflictException(
        `Job position with name '${createJobPositionDto.name}' already exists`,
      );
    }

    const jobPosition = await this.prisma.job_position.create({
      data: createJobPositionDto,
    });
    return jobPosition;
  }

  // findAll Paginated
  async findAll(
    filter: BaseFilterParams,
  ){
    const {
      search,
      page = DefaultPaginaitonValue.page,
      limit = DefaultPaginaitonValue.limit,
      sort = DefaultPaginaitonValue.sortBy,
      orderBy = DefaultPaginaitonValue.orderBy,
    } = filter;
    const skip = (page - 1) * limit;

    const where = {
      name: {
        contains: search || '',
      },
    };

    const [data, total] = await Promise.all([
      this.prisma.job_position.findMany({
        skip,
        take: limit,
        orderBy: { [sort || 'id']: (orderBy as any) || 'desc' },
        where,
      }),
      this.prisma.job_position.count({ where }),
    ]);

    return createPaginatedData(
      data,
      total,
      Number(page),
      Number(limit),
    ) ;
  }

  findOne(id: number) {
    return this.prisma.job_position.findUnique({ where: { id } });
  }

  async update(id: number, updateJobPositionDto: UpdateJobPositionDto) {
    // Check if job position with the same name already exists (excluding current record)
    if (updateJobPositionDto.name) {
      const existingJobPosition = await this.prisma.job_position.findFirst({
        where: {
          name: updateJobPositionDto.name,
          NOT: { id: id },
        },
      });

      if (existingJobPosition) {
        throw new ConflictException(
          `Job position with name '${updateJobPositionDto.name}' already exists`,
        );
      }
    }

    return this.prisma.job_position.update({
      where: { id },
      data: updateJobPositionDto,
    });
  }

  remove(id: number) {
    return this.prisma.job_position.delete({ where: { id } });
  }

  // insert and remove job positions to company
  async updateJobPositionsToCompany(
    companyId: number,
    jobPositionIds: number[],
  ) {
    const currentJobPositions = await this.prisma.company_job_position.findMany(
      {
        where: { companyId },
        select: { jobPositionId: true },
      },
    );

    const currentPositionIds = currentJobPositions.map((p) => p.jobPositionId);
    const positionsToAdd = jobPositionIds.filter(
      (id) => !currentPositionIds.includes(id),
    );
    const positionsToRemove = currentPositionIds.filter(
      (id) => !jobPositionIds.includes(id),
    );

    console.log('positionsToAdd', positionsToAdd);
    console.log('positionsToRemove', positionsToRemove);

    await this.prisma.$transaction(async (prisma) => {
      // Remove positions not in the new list
      if (positionsToRemove.length > 0) {
        await prisma.company_job_position.deleteMany({
          where: {
            companyId: companyId,
            jobPositionId: { in: positionsToRemove },
          },
        });
      }

      // Add new positions using create to avoid conflicts
      if (positionsToAdd.length > 0) {
        for (const jobPositionId of positionsToAdd) {
          await prisma.company_job_position.create({
            data: {
              companyId: companyId,
              jobPositionId: jobPositionId,
            },
          });
        }
      }
    });
  }
}
