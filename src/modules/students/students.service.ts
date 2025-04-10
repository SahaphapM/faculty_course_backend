import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateStudentDto } from 'src/generated/nestjs-dto/create-student.dto';
import { FilterParams } from 'src/dto/filter-params.dto';
import { UpdateStudentDto } from 'src/generated/nestjs-dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  // Create a new student
  async create(studentDto: CreateStudentDto) {
    try {
      const newStudent = await this.prisma.student.create({
        data: studentDto,
      });
      return newStudent;
    } catch (error) {
      throw new BadRequestException('Failed to create student', error.message);
    }
  }

  // Import multiple students
  async importStudents(students: CreateStudentDto[]) {
    if (!Array.isArray(students)) {
      throw new BadRequestException('Expected students to be an array');
    }

    const newStudents = students.map((student) => ({
      ...student,
      enrollmentDate: new Date(student.enrollmentDate),
    }));

    await this.prisma.student.createMany({
      data: newStudents,
    });
  }

  // Get all students with pagination and search
  async findAll(pag?: FilterParams) {
    const defaultLimit = 10;
    const defaultPage = 1;

    const {
      thaiName,
      engName,
      code,
      limit,
      page,
      orderBy,
      branchThaiName,
      branchEngName,
      facultyThaiName,
      facultyEngName,
    } = pag || {};

    const options: Prisma.studentFindManyArgs = {
      take: limit ?? defaultLimit,
      skip: ((page ?? defaultPage) - 1) * (limit ?? defaultLimit),
      orderBy: { id: orderBy ?? 'asc' },
      include: {
        branch: {
          select: {
            thaiName: true,
            engName: true,
            faculty: { select: { thaiName: true, engName: true } },
          },
        },
        skill_collections: true,
      },
      where: {
        ...(code && { code: { contains: code } }),
        ...(thaiName && { thaiName: { contains: thaiName } }),
        ...(engName && { engName: { contains: engName } }),
        ...(branchThaiName && {
          branch: { thaiName: { contains: branchThaiName } },
        }),
        ...(branchEngName && {
          branch: { engName: { contains: branchEngName } },
        }),
        ...(facultyThaiName && {
          branch: { faculty: { thaiName: { contains: facultyThaiName } } },
        }),
        ...(facultyEngName && {
          branch: { faculty: { engName: { contains: facultyEngName } } },
        }),
      },
    };

    try {
      const [students, total] = await Promise.all([
        this.prisma.student.findMany(options),
        this.prisma.student.count({ where: options.where }),
      ]);

      return { data: students, total };
    } catch (error) {
      console.error('Error fetching students:', error);
      throw new InternalServerErrorException('Failed to fetch students');
    }
  }

  // Find students by a list of IDs
  async findManyByCode(studentListCode: string[]) {
    try {
      return await this.prisma.student.findMany({
        where: {
          code: { in: studentListCode },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch students by Codes',
      );
    }
  }

  // Get a student by ID
  async findOne(id: number) {
    try {
      const student = await this.prisma.student.findUnique({
        where: { id },
        include: {
          skill_collections: true,
        },
      });

      if (!student) {
        throw new NotFoundException(`Student with ID "${id}" not found`);
      }

      return student;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch student');
    }
  }

  // Update a student by ID
  async update(id: number, studentDto: UpdateStudentDto) {
    try {
      const student = await this.prisma.student.update({
        where: { id },
        data: studentDto,
      });
      return student;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Student with ID "${id}" not found`);
      }
      throw new BadRequestException('Failed to update student');
    }
  }

  // Delete a student by ID
  async remove(id: number): Promise<void> {
    try {
      await this.prisma.student.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Student with ID "${id}" not found`);
      }
      throw new BadRequestException('Failed to delete student');
    }
  }
}
