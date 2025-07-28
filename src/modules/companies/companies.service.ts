import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  BaseFilterParams,
  PaginatedResult,
} from 'src/dto/filters/filter.base.dto';
import { Company } from 'src/generated/nestjs-dto/company.entity';
import { CreateCompanyWithJobPositionsDto } from './dto/create.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}
  create(createCompanyDto: CreateCompanyWithJobPositionsDto) {
    const { jobPositions, ...rest } = createCompanyDto;
    const company = this.prisma.company.create({
      data: {
        ...rest,
        company_job_positions: {
          create: jobPositions.map((jobPosition) => ({
            jobPositionId: jobPosition.id,
          })),
        },
      },
      include: { company_job_positions: { include: { jobPosition: true } } },
    });
    return company;
  }

  async findAll(filter: BaseFilterParams): Promise<PaginatedResult<Company>> {
    const { search, page = 1, limit = 10, sort } = filter;
    const skip = (page - 1) * limit;

    const data = await this.prisma.company.findMany({
      skip,
      take: limit,
      orderBy: sort
        ? { [sort.replace('-', '')]: sort.startsWith('-') ? 'desc' : 'asc' }
        : { id: 'asc' },
      where: {
        OR: [
          { name: { contains: search ? search : '' } },
          { tel: { contains: search ? search : '' } },
          { email: { contains: search ? search : '' } },
        ],
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

  findOne(id: number): Promise<Company> {
    return this.prisma.company.findUnique({
      where: { id },
      include: { company_job_positions: { include: { jobPosition: true } } },
    });
  }

  async update(
    id: number,
    updateCompanyDto: CreateCompanyWithJobPositionsDto,
  ): Promise<Company> {
    const { jobPositions, ...rest } = updateCompanyDto;
    const jobPositionIds = jobPositions.map((jp) => jp.id);

    // Get current job positions
    const currentPositions = await this.prisma.company_job_position.findMany({
      where: { companyId: id },
      select: { jobPositionId: true },
    });

    const currentPositionIds = currentPositions.map((p) => p.jobPositionId);
    const positionsToAdd = jobPositionIds.filter(
      (id) => !currentPositionIds.includes(id),
    );
    const positionsToRemove = currentPositionIds.filter(
      (id) => !jobPositionIds.includes(id),
    );

    return this.prisma.$transaction(async (prisma) => {
      // Remove positions not in the new list
      if (positionsToRemove.length > 0) {
        await prisma.company_job_position.deleteMany({
          where: {
            companyId: id,
            jobPositionId: { in: positionsToRemove },
          },
        });
      }

      // Add new positions
      if (positionsToAdd.length > 0) {
        await prisma.company_job_position.createMany({
          data: positionsToAdd.map((jobPositionId) => ({
            companyId: id,
            jobPositionId,
          })),
        });
      }

      // Update company details
      return prisma.company.update({
        where: { id },
        data: rest,
        include: {
          company_job_positions: {
            include: {
              jobPosition: true,
            },
          },
        },
      });
    });
  }

  remove(id: number) {
    return this.prisma.company.delete({ where: { id } });
  }
}
