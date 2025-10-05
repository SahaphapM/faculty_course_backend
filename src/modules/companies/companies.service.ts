import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  BaseFilterParams,
} from 'src/dto/filters/filter.base.dto';
import { Company } from 'src/generated/nestjs-dto/company.entity';
import { CreateCompanyWithJobPositionsDto } from './dto/create-company-with-job.dto';
import { createPaginatedData } from 'src/utils/paginated.utils';
import { DefaultPaginaitonValue } from 'src/configs/pagination.configs';
import { AppErrorCode } from 'src/common/error-codes';
import type { ForeignKeyConflictError } from 'src/common/conflict-error';

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

  async remove(id: number) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    const internshipCount = await this.prisma.internship.count({
      where: { companyId: id },
    });

    const studentInternshipCount = await this.prisma.student_internship.count({
      where: { internship: { companyId: id } },
    });

    const blockers: Array<
      ForeignKeyConflictError['blockers'][number] & {
        entities?: Array<{ id: number | string; name: string; details?: string }>;
      }
    > = [];

    if (internshipCount > 0) {
      const internships = await this.prisma.internship.findMany({
        where: { companyId: id },
        select: {
          id: true,
          year: true,
          curriculum: {
            select: {
              code: true,
              thaiName: true,
              engName: true,
            },
          },
        },
        orderBy: { id: 'asc' },
        take: 5,
      });

      blockers.push({
        relation: 'Internship',
        count: internshipCount,
        field: 'companyId',
        entities: internships.map((internship) => {
          const curriculumName =
            internship.curriculum?.thaiName || internship.curriculum?.engName;
          const curriculumLabel = internship.curriculum
            ? [internship.curriculum.code, curriculumName]
                .filter(Boolean)
                .join(' - ')
            : undefined;

          return {
            id: internship.id,
            name: `Internship #${internship.id}${
              internship.year ? ` (${internship.year})` : ''
            }`,
            details: curriculumLabel,
          };
        }),
      });
    }

    if (studentInternshipCount > 0) {
      const studentInternships = await this.prisma.student_internship.findMany({
        where: { internship: { companyId: id } },
        select: {
          id: true,
          student: {
            select: {
              id: true,
              code: true,
              thaiName: true,
              engName: true,
            },
          },
          internship: {
            select: {
              id: true,
              year: true,
            },
          },
        },
        orderBy: { id: 'asc' },
        take: 5,
      });

      blockers.push({
        relation: 'StudentInternship',
        count: studentInternshipCount,
        field: 'internshipId',
        entities: studentInternships.map((record) => {
          const studentName =
            record.student?.thaiName || record.student?.engName || 'Student';
          const studentLabel = record.student?.code
            ? `${record.student.code} - ${studentName}`
            : studentName;
          const internshipLabel = record.internship
            ? `Internship #${record.internship.id}${
                record.internship.year ? ` (${record.internship.year})` : ''
              }`
            : undefined;

          return {
            id: record.id,
            name: studentLabel,
            details: internshipLabel,
          };
        }),
      });
    }

    if (blockers.length > 0) {
      const payload: ForeignKeyConflictError & {
        entityName?: string;
        blockers: (ForeignKeyConflictError['blockers'][number] & {
          entities?: Array<{ id: number | string; name: string; details?: string }>;
        })[];
      } = {
        code: AppErrorCode.FK_CONFLICT,
  message: `Cannot delete Company "${company.name}" because there are related records referencing it.`,
        entity: 'Company',
        entityName: company.name,
        id,
        blockers,
        suggestions: [
          'Reassign or delete internships referencing this company.',
          'Detach or reassign student internships before deleting the company.',
        ],
      };

      throw new ConflictException(payload);
    }

    return this.prisma.company.delete({ where: { id } });
  }
}
