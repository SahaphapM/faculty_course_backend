import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
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

  async create(createJobPositionDto: CreateJobPositionDto) {
    // Check if job position with the same name already exists
    const existingJobPosition = await this.prisma.job_position.findFirst({
      where: { name: createJobPositionDto.name }
    });

    if (existingJobPosition) {
      throw new ConflictException(`Job position with name '${createJobPositionDto.name}' already exists`);
    }

    const jobPosition = await this.prisma.job_position.create({
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

  async update(id: number, updateJobPositionDto: UpdateJobPositionDto) {
    // Check if job position with the same name already exists (excluding current record)
    if (updateJobPositionDto.name) {
      const existingJobPosition = await this.prisma.job_position.findFirst({
        where: {
          name: updateJobPositionDto.name,
          NOT: { id: id }
        }
      });

      if (existingJobPosition) {
        throw new ConflictException(`Job position with name '${updateJobPositionDto.name}' already exists`);
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
}
