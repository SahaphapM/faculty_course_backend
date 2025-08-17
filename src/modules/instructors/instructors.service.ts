import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInstructorDto } from 'src/generated/nestjs-dto/create-instructor.dto';
import { UpdateInstructorDto } from 'src/generated/nestjs-dto/update-instructor.dto';
import { Prisma } from '@prisma/client';
import { InstructorFilterDto } from 'src/dto/filters/filter.instructors.dto';
import { createPaginatedData } from 'src/utils/paginated.utils';

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
    const defaultLimit = 10;
    const defaultPage = 1;

    const {
      limit,
      page,
      orderBy,
      sort,
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
      orderBy: { [(sort === '' ? 'id' : sort) ?? 'id']: orderBy ?? 'asc' },
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
    const { limit, page, orderBy, sort } = query || {};

    const options: Prisma.instructorFindManyArgs = {
      where: {
        user: { is: null },
      },
      take: limit || 10,
      skip: ((page || 1) - 1) * (limit || 10),
      orderBy: { [(sort === '' ? 'id' : sort) ?? 'id']: orderBy ?? 'asc' },
    };

    const result = this.prisma.instructor.findMany(options);

    const total = this.prisma.instructor.count({
      where: {
        user: { is: null },
      },
    });

    const response = await Promise.all([result, total]);

    return createPaginatedData(
      response[0],
      response[1],
      Number(page || 1),
      Number(limit || 10),
    );
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
    try {
      await this.prisma.instructor.delete({
        where: { id },
      });
      return `Success Delete ID ${id}`;
    } catch (error) {
      console.error('Error removing instructor:', error);
      throw new BadRequestException('Failed to remove Instructor/Coordinator');
    }
  }
}
