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

  async findAll(pag?: InstructorFilterDto) {
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

  async updateCoordinatorToCurriculum(
    instructorId: number,
    curriculumId: number,
  ) {
    if (!instructorId) {
      throw new BadRequestException('Instructor ID is required');
    }

    // Use a transaction to ensure atomicity
    return this.prisma.$transaction(async (prisma) => {
      // If curriculumId is negative or zero, remove only from the specific curriculum
      if (curriculumId <= 0) {
        await prisma.curriculum_coordinators.deleteMany({
          where: {
            instructorId,
          },
        });
        return {
          message: `Success: Removed Instructor ID ${instructorId} from all curriculums`,
        };
      }

      // Insert/Update only if curriculumId is valid
      await prisma.curriculum_coordinators.upsert({
        where: {
          instructorId_curriculumId: {
            instructorId,
            curriculumId,
          },
        },
        create: {
          instructorId,
          curriculumId,
        },
        update: {}, // No update needed, just ensure existence
      });

      return {
        message: `Success: Updated Instructor ID ${instructorId} to Curriculum ID ${curriculumId}`,
      };
    });
  }

  async update(id: number, updateTeacherDto: UpdateInstructorDto) {
    try {
      const teacher = await this.prisma.instructor.update({
        where: { id },
        data: updateTeacherDto,
      });
      return teacher;
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
