import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SubjectFilterDto } from 'src/dto/filters/filter.subject.dto';
import { CreateSubjectDto } from 'src/generated/nestjs-dto/create-subject.dto';
import { UpdateSubjectDto } from 'src/generated/nestjs-dto/update-subject.dto';
import { PrismaService } from 'src/prisma/prisma.service'; // Adjust the import path as needed
import { createPaginatedData } from 'src/utils/paginated.utils';
import { DefaultPaginaitonValue } from 'src/configs/pagination.configs';

@Injectable()
export class SubjectService {
  constructor(private prisma: PrismaService) {}

  async findAll(pag?: SubjectFilterDto) {
  const defaultLimit = DefaultPaginaitonValue.limit;
  const defaultPage = DefaultPaginaitonValue.page;

    const {
      limit,
      page,
  sort = DefaultPaginaitonValue.sortBy,
  orderBy = DefaultPaginaitonValue.orderBy,
      nameCode,
      type,
      branchId,
      curriculumId,
      facultyId,
    } = pag || {};

    console.log(pag);

    const where: Prisma.subjectWhereInput = {
      ...(nameCode && {
        OR: [
          { thaiName: { contains: nameCode } },
          { engName: { contains: nameCode } },
          { code: { contains: nameCode } },
        ],
      }),
      ...(type && { type }),

      // Handle curriculum, branch, faculty like else if

      ...(facultyId
        ? {
            curriculums: {
              some: {
                curriculum: {
                  branch: {
                    facultyId,
                  },
                },
              },
            },
          }
        : {}),
      ...(branchId
        ? {
            curriculums: {
              some: {
                curriculum: {
                  branchId,
                },
              },
            },
          }
        : {}),

      ...(curriculumId
        ? {
            curriculumId,
          }
        : {}),
    };
    const options: Prisma.subjectFindManyArgs = {
      where,
      skip: ((page ?? defaultPage) - 1) * (limit || defaultLimit),
      take: limit || defaultLimit,
  orderBy: { [(sort === '' ? 'id' : sort) ?? 'id']: (orderBy as Prisma.SortOrder) ?? 'asc' },
      include: {
        clos: true,
      },
    };

    const [subjects, total] = await Promise.all([
      this.prisma.subject.findMany(options),
      this.prisma.subject.count({ where: options.where }),
    ]);
    return createPaginatedData(
      subjects,
      total,
      Number(page ?? defaultPage),
      Number(limit ?? defaultLimit),
    );
  }

  async findOne(id: number) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        clos: true,
      },
    });

    return subject;
  }

  async findOneByCode(code: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { code },
      include: {
        clos: true,
      },
    });

    return subject;
  }

  async create(dto: CreateSubjectDto) {
    const subject = await this.prisma.subject.create({
      data: {
        ...dto,
        curriculumId: dto.curriculumId,
      },
    });

    return subject;
  }

  async update(id: number, dto: UpdateSubjectDto) {
    const subject = await this.prisma.subject.update({
      where: { id: id },
      data: {
        ...dto,
        curriculumId: dto.curriculumId,
      },
    });

    return subject;
  }

  async remove(id: number) {
    const subject = await this.prisma.subject.delete({
      where: { id },
    });
    return subject;
  }
}
