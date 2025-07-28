import { Injectable } from '@nestjs/common';
import { CreateJobPositionDto } from 'src/generated/nestjs-dto/create-jobPosition.dto';
import { UpdateJobPositionDto } from 'src/generated/nestjs-dto/update-jobPosition.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  BaseFilterParams,
  PaginatedResult,
} from 'src/dto/filters/filter.base.dto';
import { JobPosition } from 'src/generated/nestjs-dto/jobPosition.entity';

@Injectable()
export class JobPositionsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createJobPositionDto: CreateJobPositionDto) {
    const jobPosition = this.prisma.job_position.create({
      data: createJobPositionDto,
    });
    return jobPosition;
  }

  // findAll Paginated
  async findAll(
    filter: BaseFilterParams,
  ): Promise<PaginatedResult<JobPosition>> {
    const { search, page = 1, limit = 5, sort } = filter;
    const skip = (page - 1) * limit;

    const data = await this.prisma.job_position.findMany({
      skip,
      take: limit,
      orderBy: sort
        ? { [sort.replace('-', '')]: sort.startsWith('-') ? 'desc' : 'asc' }
        : { id: 'asc' },
      where: {
        name: {
          contains: search,
        },
      },
    });

    const totalPages = Math.ceil(data.length / limit);

    return {
      data,
      meta: {
        total: data.length,
        page: Number(page),
        limit: Number(limit),
        totalPages,
      },
    };
  }

  findOne(id: number) {
    return this.prisma.job_position.findUnique({ where: { id } });
  }

  update(id: number, updateJobPositionDto: UpdateJobPositionDto) {
    return this.prisma.job_position.update({
      where: { id },
      data: updateJobPositionDto,
    });
  }

  remove(id: number) {
    return this.prisma.job_position.delete({ where: { id } });
  }
}
