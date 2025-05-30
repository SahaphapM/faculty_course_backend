import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SubjectFilterDto } from 'src/dto/filters/filter.subject.dto';
import { CreateSubjectDto } from 'src/generated/nestjs-dto/create-subject.dto';
import { UpdateSubjectDto } from 'src/generated/nestjs-dto/update-subject.dto';
import { PrismaService } from 'src/prisma/prisma.service'; // Adjust the import path as needed

@Injectable()
export class SubjectService {
  constructor(private prisma: PrismaService) {}

  async findAll(pag?: SubjectFilterDto) {
    const defaultLimit = 10;
    const defaultPage = 1;

    const {
      limit,
      page,
      sort,
      orderBy,
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
      orderBy: { [(sort === '' ? 'id' : sort) ?? 'id']: orderBy ?? 'asc' },
      include: {
        clos: true,
      },
    };

    const [subjects, total] = await Promise.all([
      this.prisma.subject.findMany(options),
      this.prisma.subject.count({ where: options.where }),
    ]);
    return { data: subjects, total };
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

    // copy subject
    await this.prisma.lesson.create({
      data: {
        thaiName: dto.thaiName,
        engName: dto.engName,
        subjectId: subject.id,
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
