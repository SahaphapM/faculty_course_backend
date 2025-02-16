import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PaginationDto } from '../../dto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInstructorDto } from 'src/generated/nestjs-dto/create-instructor.dto';
import { UpdateInstructorDto } from 'src/generated/nestjs-dto/update-instructor.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class InstructorsService {
  constructor(private prisma: PrismaService) {}

  findByListCode(c: string[]) {
    return this.prisma.instructor.findMany({ where: { code: { in: c } } });
  }

  async create(dto: CreateInstructorDto) {
    // Check if the teacher with this email already exists
    const existingTeacher = await this.prisma.instructor.findUnique({
      where: { code: dto.email },
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

  async findAll(pag?: PaginationDto) {
    const defaultLimit = 10;
    const defaultPage = 1;

    const {
      thaiName,
      engName,
      code,
      limit,
      page,
      orderBy,
      curriculumCode,
      email,
      branchThaiName,
      branchEngName,
    } = pag || {};

    const whereCondition: Prisma.instructorWhereInput = {
      ...(code && { code: code }),
      ...(thaiName && { thaiName: { contains: thaiName } }),
      ...(engName && { engName: { contains: engName } }),
      ...(email && { email: { contains: email } }),
      ...(branchThaiName && {
        branch: { thaiName: { contains: branchThaiName } },
      }),
      ...(branchEngName && {
        branch: { engName: { contains: branchEngName } },
      }),

      ...(curriculumCode && {
        curriculums: { some: { curriculum: { code: curriculumCode } } },
      }),
    };

    const selectCondition: Prisma.instructorSelect = {
      id: true,
      code: true,
      email: true,
      thaiName: true,
      engName: true,
      tel: true,
      position: true,
      branch: {
        select: {
          id: true,
          thaiName: true,
          engName: true,
        },
      },
    };

    if (!pag) {
      // No pagination → fetch all
      return this.prisma.instructor.findMany({
        where: whereCondition,
        select: selectCondition,
        orderBy: { id: 'asc' }, // Default sorting
      });
    }

    // With pagination
    const options: Prisma.instructorFindManyArgs = {
      take: limit || defaultLimit,
      skip: ((page || defaultPage) - 1) * (limit || defaultLimit),
      orderBy: { id: orderBy || 'asc' },
      select: selectCondition,
      where: whereCondition,
    };

    try {
      const [instructors, total] = await Promise.all([
        this.prisma.instructor.findMany(options),
        this.prisma.instructor.count({ where: whereCondition }),
      ]);
      return { data: instructors, total };
    } catch (error) {
      console.error('Error fetching instructors:', error);
      throw new InternalServerErrorException('Failed to fetch instructors');
    }
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

  async updateCoordinatorToCurriculum(teacherId: number, curriculumId: number) {
    // Find the instructor
    const teacher = await this.prisma.instructor.findUnique({
      where: { id: teacherId },
    });

    // Find the curriculum
    const curriculum = await this.prisma.curriculum.findUnique({
      where: { id: curriculumId },
    });

    // Validate instructor exists
    if (!teacher) {
      throw new NotFoundException(`Instructor with ID ${teacherId} not found`);
    }

    // Validate curriculum exists
    if (!curriculum) {
      throw new NotFoundException(
        `Curriculum with ID ${curriculumId} not found`,
      );
    }

    // Update curriculum with coordinator
    await this.prisma.curriculum.update({
      where: { id: curriculumId },
      data: {
        coordinators: {
          // Many to many
          connect: {
            instructorId_curriculumId: {
              instructorId: teacherId,
              curriculumId,
            },
          },
        },
      },
    });

    return `Success: Assigned Instructor ID ${teacherId} to Curriculum ID ${curriculumId}`;
  }

  async update(id: number, updateTeacherDto: UpdateInstructorDto) {
    try {
      await this.prisma.instructor.update({
        where: { id },
        data: updateTeacherDto,
      });
      return `Success Update ID ${id}`;
    } catch (error) {
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
      throw new BadRequestException('Failed to remove Instructor/Coordinator');
    }
  }
}
