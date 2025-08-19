import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  BaseFilterParams,
} from 'src/dto/filters/filter.base.dto';
import { Company } from 'src/generated/nestjs-dto/company.entity';
import { CreateCompanyWithJobPositionsDto } from './dto/create-company-with-job.dto';
import { createPaginatedData } from 'src/utils/paginated.utils';
import { DefaultPaginaitonValue } from 'src/configs/pagination.configs';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}
  create(createCompanyDto: CreateCompanyWithJobPositionsDto) {
    const { jobPositions, ...rest } = createCompanyDto;
    const company = this.prisma.company.create({
      data: {
        name: rest.name,
        description: rest.description,
        address: rest.address,
        tel: rest.tel,
        email: rest.email,
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

  async findAll(filter: BaseFilterParams){
    const {
      search,
      page = DefaultPaginaitonValue.page,
      limit = DefaultPaginaitonValue.limit,
      sort = DefaultPaginaitonValue.sortBy,
      orderBy = DefaultPaginaitonValue.orderBy,
    } = filter;
    const skip = (page - 1) * limit;

    const where = {
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { tel: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.company.findMany({
        skip,
        take: limit,
  orderBy: { [sort || 'id']: (orderBy as any) || 'asc' },
        where,
        include: {
          company_job_positions: {
            include: {
              jobPosition: true,
            },
          },
        },
      }),
      this.prisma.company.count({ where }),
    ]);

    return createPaginatedData(
      data,
      total,
      Number(page),
      Number(limit),
    );
  }

  findOne(id: number): Promise<Company> {
    return this.prisma.company.findUnique({
      where: { id },
      include: {
        company_job_positions: {
          include: {
            jobPosition: true,
          },
        },
      },
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

      // Add new positions using create to avoid conflicts
      if (positionsToAdd.length > 0) {
        for (const jobPositionId of positionsToAdd) {
          await prisma.company_job_position.create({
            data: {
              companyId: id,
              jobPositionId,
            },
          });
        }
      }

      // Update company details with explicit field mapping
      return prisma.company.update({
        where: { id },
        data: {
          name: rest.name,
          description: rest.description,
          address: rest.address,
          tel: rest.tel,
          email: rest.email,
        },
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
