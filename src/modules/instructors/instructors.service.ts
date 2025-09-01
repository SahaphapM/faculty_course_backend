import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInstructorDto } from 'src/generated/nestjs-dto/create-instructor.dto';
import { UpdateInstructorDto } from 'src/generated/nestjs-dto/update-instructor.dto';
import { Prisma } from '@prisma/client';
import { InstructorFilterDto } from 'src/dto/filters/filter.instructors.dto';
import { createPaginatedData } from 'src/utils/paginated.utils';
import { DefaultPaginaitonValue } from 'src/configs/pagination.configs';
import { AppErrorCode } from 'src/common/error-codes';

@Injectable()
export class InstructorsService {
  constructor(private prisma: PrismaService) {}

  findByListCode(c: string[]) {
    return this.prisma.instructor.findMany({ where: { code: { in: c } } });
  }

  async create(dto: CreateInstructorDto) {
    // Check if the teacher with this email already exists
    const existingTeacher = await this.prisma.instructor.findUnique({
      where: { email: dto.email },
    });

    if (existingTeacher) {
      throw new BadRequestException(
        `Instructor with code ${dto.email} already exists`,
      );
    }

    // Create teacher instance, conditionally adding optional fields
    const teacher = await this.prisma.instructor.create({
      data: dto,
    });

    return teacher;
  }

  async findAll(params?: InstructorFilterDto) {
  const defaultLimit = DefaultPaginaitonValue.limit;
  const defaultPage = DefaultPaginaitonValue.page;

    const {
      limit,
      page,
  orderBy = DefaultPaginaitonValue.orderBy,
  sort = DefaultPaginaitonValue.sortBy,
      nameCodeMail,
      curriculumId,
      branchId,
      facultyId,
      courseId,
    } = params || {};

    const whereCondition: Prisma.instructorWhereInput = {
      ...(nameCodeMail && {
        OR: [
          { code: { contains: nameCodeMail } },
          { thaiName: { contains: nameCodeMail } },
          { engName: { contains: nameCodeMail } },
          { email: { contains: nameCodeMail } },
        ],
      }),
      ...(curriculumId && { curriculums: { some: { curriculumId } } }),
      ...(branchId && { branchId }),
      ...(facultyId && { branch: { facultyId } }),
      ...(courseId && { course_instructors: { some: { courseId } } }),
    };

    // With pagination
    const options: Prisma.instructorFindManyArgs = {
      take: limit || defaultLimit,
      skip: ((page || defaultPage) - 1) * (limit || defaultLimit),
  orderBy: { [(sort === '' ? 'id' : sort) ?? 'id']: orderBy as Prisma.SortOrder },
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

    try {
      const [instructors, total] = await Promise.all([
        this.prisma.instructor.findMany(options),
        this.prisma.instructor.count({ where: whereCondition }),
      ]);
      return createPaginatedData(
        instructors,
        total,
        Number(page || defaultPage),
        Number(limit || defaultLimit),
      );
    } catch (error) {
      console.error('Error fetching instructors:', error);
      throw new InternalServerErrorException('Failed to fetch instructors');
    }
  }

  async findAvailableInstructorsForUser(query: InstructorFilterDto) {
    const {
      limit = DefaultPaginaitonValue.limit,
      page = DefaultPaginaitonValue.page,
      orderBy = DefaultPaginaitonValue.orderBy,
      sort = DefaultPaginaitonValue.sortBy,
    } = query || {};

    const options: Prisma.instructorFindManyArgs = {
      where: {
        user: { is: null },
      },
  take: limit,
  skip: (page - 1) * limit,
  orderBy: { [(sort === '' ? 'id' : sort) ?? 'id']: orderBy as Prisma.SortOrder },
    };

    const result = this.prisma.instructor.findMany(options);

    const total = this.prisma.instructor.count({
      where: {
        user: { is: null },
      },
    });

    const response = await Promise.all([result, total]);

  return createPaginatedData(response[0], response[1], Number(page), Number(limit));
  }

  async findOne(id: number) {
    const teacher = await this.prisma.instructor.findUnique({
      where: { id },
    });
    if (!teacher) {
      throw new NotFoundException(
        `Instructor/Coordinator with ID ${id} not found`,
      );
    }
    return teacher;
  }

  async update(id: number, updateTeacherDto: UpdateInstructorDto) {
    try {
      const teacher = await this.prisma.instructor.update({
        where: { id },
        data: updateTeacherDto,
      });
      return teacher;
    } catch (error) {
      console.error('Error updating instructor:', error);
      throw new BadRequestException('Failed to update Instructor/Coordinator');
    }
  }

  async remove(id: number) {
    // 1) Check if instructor exists
    const instructor = await this.prisma.instructor.findUnique({ where: { id } });
    if (!instructor) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Instructor not found',
      });
    }

    // 2) Check for course_instructors that reference this instructor (onDelete: Restrict)
    const courseInstructorCount = await this.prisma.course_instructor.count({ 
      where: { instructorId: id } 
    });

    if (courseInstructorCount > 0) {
      // Get the actual blocking course instructors with details
      const blockingCourseInstructors = await this.prisma.course_instructor.findMany({
        where: { instructorId: id },
        select: {
          id: true,
          course: {
            select: {
              id: true,
              year: true,
              semester: true,
              subject: {
                select: {
                  code: true,
                  thaiName: true,
                  engName: true,
                },
              },
            },
          },
        },
        take: 10, // Limit to first 10 for performance
      });

      throw new ConflictException({
        code: AppErrorCode.FK_CONFLICT,
        message: `Cannot delete Instructor "${instructor.thaiName || instructor.engName}" because there are Course Instructors referencing it.`,
        entity: 'Instructor',
        entityName: instructor.thaiName || instructor.engName || `Instructor #${id}`,
        id,
        blockers: [{ 
          relation: 'CourseInstructor', 
          count: courseInstructorCount, 
          field: 'instructorId',
          entities: blockingCourseInstructors.map(ci => ({
            id: ci.id,
            name: `Course Assignment #${ci.id}`,
            details: ci.course ? `${ci.course.subject?.code || 'Unknown'} - ${ci.course.subject?.thaiName || ci.course.subject?.engName || 'Unknown Subject'} (${ci.course.year}/${ci.course.semester})` : 'Unknown course',
          })),
        }],
        suggestions: [
          'Delete or reassign those Course Instructors to a different Instructor.',
          'If business allows, detach Course Instructors first then delete Instructor.',
          'Consider soft-delete/archiving instead of hard delete.',
        ],
      });
    }

    // 3) Safe to delete
    await this.prisma.instructor.delete({ where: { id } });
    return { ok: true };
  }
}
