import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SubjectFilterDto } from 'src/dto/filters/filter.subject.dto';
import { CreateSubjectDto } from 'src/generated/nestjs-dto/create-subject.dto';
import { UpdateSubjectDto } from 'src/generated/nestjs-dto/update-subject.dto';
import { PrismaService } from 'src/prisma/prisma.service'; // Adjust the import path as needed
import { createPaginatedData } from 'src/utils/paginated.utils';
import { DefaultPaginaitonValue } from 'src/configs/pagination.configs';
import { AppErrorCode } from 'src/common/error-codes';

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
    // 1) Check if subject exists
    const subject = await this.prisma.subject.findUnique({ where: { id } });
    if (!subject) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Subject not found',
      });
    }

    // 2) Check for courses that reference this subject (onDelete: Restrict)
    const courseCount = await this.prisma.course.count({ where: { subjectId: id } });

    if (courseCount > 0) {
      // Get the actual blocking courses with details
      const blockingCourses = await this.prisma.course.findMany({
        where: { subjectId: id },
        select: {
          id: true,
          year: true,
          semester: true,
          active: true,
        },
        take: 10, // Limit to first 10 for performance
      });

      throw new ConflictException({
        code: AppErrorCode.FK_CONFLICT,
        message: `Cannot delete Subject "${subject.code} - ${subject.thaiName || subject.engName}" because there are Courses referencing it.`,
        entity: 'Subject',
        entityName: `${subject.code} - ${subject.thaiName || subject.engName || `Subject #${id}`}`,
        id,
        blockers: [{ 
          relation: 'Course', 
          count: courseCount, 
          field: 'subjectId',
          entities: blockingCourses.map(course => ({
            id: course.id,
            name: `Course #${course.id}`,
            details: `Year ${course.year}, Semester ${course.semester}${course.active ? '' : ' (Inactive)'}`,
          })),
        }],
        suggestions: [
          'Delete or reassign those Courses to a different Subject.',
          'If business allows, detach Courses first then delete Subject.',
          'Consider soft-delete/archiving instead of hard delete.',
        ],
      });
    }

    // 3) Safe to delete
    await this.prisma.subject.delete({ where: { id } });
    return { ok: true };
  }
}
