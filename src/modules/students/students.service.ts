import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateStudentDto } from 'src/generated/nestjs-dto/create-student.dto';
import { UpdateStudentDto } from 'src/generated/nestjs-dto/update-student.dto';
import { StudentFilterDto } from 'src/dto/filters/filter.student.dto';

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

    await this.prisma.$transaction(
      students.map((cur) =>
        this.prisma.student.upsert({
          where: { code: cur.code },
          update: { ...cur },
          create: { ...cur },
        }),
      ),
    );
  }

  // Get all students with pagination and search
  async findAll(pag?: StudentFilterDto) {
    const defaultLimit = 10;
    const defaultPage = 1;

    const {
      limit,
      page,
      orderBy,
      nameCode,
      branchName,
      facultyName,
      skillName,
    } = pag || {};

    console.log(pag);

    const where: Prisma.studentWhereInput = {
      ...(nameCode && {
        OR: [
          { thaiName: { contains: nameCode } },
          { engName: { contains: nameCode } },
          { code: { contains: nameCode } },
        ],
      }),
      ...(branchName || facultyName
        ? {
            branch: {
              ...(branchName && {
                OR: [
                  { thaiName: { contains: branchName } },
                  { engName: { contains: branchName } },
                ],
              }),
              ...(facultyName && {
                faculty: {
                  OR: [
                    { thaiName: { contains: facultyName } },
                    { engName: { contains: facultyName } },
                  ],
                },
              }),
            },
          }
        : {}),
      ...(skillName && {
        skill_collections: {
          some: {
            clo: {
              is: {
                skill: {
                  is: {
                    OR: [
                      { thaiName: { contains: skillName } },
                      { engName: { contains: skillName } },
                    ],
                  },
                },
              },
            },
          },
        },
      }),
    };

    const options: Prisma.studentFindManyArgs = {
      where,
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
      },
    };

    const [students, total] = await Promise.all([
      this.prisma.student.findMany(options),
      this.prisma.student.count({ where: options.where }),
    ]);

    return { data: students, total };
  }

  // Find students by a list of IDs
  async findManyByCode(studentListCode: string[]) {
    return await this.prisma.student.findMany({
      where: {
        code: { in: studentListCode },
      },
    });
  }

  // Get a student by ID
  async findOne(code: string) {
    const student = await this.prisma.student.findUnique({
      where: { code },
      include: {
        skill_collections: true,
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID "${code}" not found`);
    }

    return student;
  }

  // Update a student by ID
  async update(id: number, studentDto: UpdateStudentDto) {
    const student = await this.prisma.student.update({
      where: { id },
      data: studentDto,
    });
    return student;
  }

  // Delete a student by ID
  async remove(id: number) {
    const student = await this.prisma.student.delete({
      where: { id },
    });
    return student;
  }

  async findAllBySkill(pag?: StudentFilterDto) {
    const defaultLimit = 10;
    const defaultPage = 1;

    const { limit, page, orderBy, skillName } = pag || {};

    const options: Prisma.studentFindManyArgs = {
      where: {
        skill_collections: {
          some: {
            clo: {
              is: {
                skill: {
                  is: {
                    OR: [
                      { thaiName: { contains: skillName } },
                      { engName: { contains: skillName } },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      take: limit ?? defaultLimit,
      skip: ((page ?? defaultPage) - 1) * (limit ?? defaultLimit),
      orderBy: { id: orderBy ?? 'asc' },
      //
      include: {
        skill_collections: {
          where: {
            clo: {
              is: {
                skill: {
                  is: {
                    OR: [
                      { thaiName: { contains: skillName } },
                      { engName: { contains: skillName } },
                    ],
                  },
                },
              },
            },
          },
          select: {
            gainedLevel: true,
            clo: {
              select: {
                name: true,
                skill: {
                  select: {
                    id: true,
                    thaiName: true,
                    engName: true,
                  },
                },
              },
            },
          },
        },
      },
    };

    const [students, total] = await Promise.all([
      this.prisma.student.findMany(options),
      this.prisma.student.count({ where: options.where }),
    ]);

    return { data: students, total };
  }
}
