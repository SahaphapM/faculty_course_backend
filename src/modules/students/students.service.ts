import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateStudentDto } from 'src/generated/nestjs-dto/create-student.dto';
import { UpdateStudentDto } from 'src/generated/nestjs-dto/update-student.dto';
import { StudentFilterDto } from 'src/dto/filters/filter.student.dto';
import { createPaginatedData } from 'src/utils/paginated.utils';
import { DefaultPaginaitonValue } from 'src/configs/pagination.configs';
import { AppErrorCode } from 'src/common/error-codes';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  // Create a new student
  async create(studentDto: CreateStudentDto) {
    try {
      const newStudent = await this.prisma.student.create({
        data: studentDto,
      });

      let skillIds: number[] = [];
      if (studentDto.curriculumId) {
        const skills = await this.prisma.skill.findMany({
          select: {
            id: true,
          },
          where: {
            parent: null,
            curriculumId: studentDto.curriculumId,
          },
        });
        skillIds = skills.map((s) => s.id);
      }

      // create skill assessment for new student
      await this.createSkillAssessments(newStudent.id, skillIds);

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

    const curriculum = await this.prisma.curriculum.findUnique({
      where: {
        id: students[0].curriculumId,
      },
      select: {
        id: true,
        branchId: true,
      },
    });

    const studentsUpsert = await this.prisma.$transaction(
      students.map((cur) => {
        return this.prisma.student.upsert({
          where: { code: cur.code },
          update: { ...cur },
          create: { ...cur, branchId: curriculum?.branchId },
        });
      }),
    );

    if (curriculum) {
      const skills = await this.prisma.skill.findMany({
        select: {
          id: true,
        },
        where: {
          parent: null,
          curriculumId: curriculum.id,
        },
      });

      const skillIds = skills.map((s) => s.id);

      for (const student of studentsUpsert) {
        await this.createSkillAssessments(student.id, skillIds);
      }
    }
  }

  // Get all students with pagination and search
  async findAll(pag?: StudentFilterDto) {
    const defaultLimit = DefaultPaginaitonValue.limit;
    const defaultPage = DefaultPaginaitonValue.page;

    const {
      limit,
      page,
      orderBy = DefaultPaginaitonValue.orderBy,
      sort = DefaultPaginaitonValue.sortBy,
      nameCode,
      branchId,
      facultyId,
      curriculumId,
      skillName,
      codeYears,
    } = pag || {};

    const or: Prisma.studentWhereInput[] = [];

    if (nameCode) {
      or.push(
        { code: { contains: nameCode } },
        { thaiName: { contains: nameCode } },
        { engName: { contains: nameCode } },
      );
    }

    const where: Prisma.studentWhereInput = {
      ...(or.length ? { OR: or } : {}),
      ...(codeYears?.length
        ? {
            AND: codeYears.map((year) => ({
              code: { startsWith: year.slice(-2) },
            })),
          }
        : {}),
      ...(curriculumId && { curriculumId }),
      ...(branchId && { branchId }),
      ...(facultyId && { branch: { facultyId } }),
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

    console.dir(where, { depth: 10 });

    const options: Prisma.studentFindManyArgs = {
      where,
      take: limit ?? defaultLimit,
      skip: ((page ?? defaultPage) - 1) * (limit ?? defaultLimit),
      orderBy: {
        [(sort === '' ? 'id' : sort) ?? 'id']: orderBy as Prisma.SortOrder,
      },
      include: {
        branch: {
          select: {
            thaiName: true,
            engName: true,
          },
        },
        curriculum: {
          select: {
            id: true,
            code: true,
            thaiName: true,
            engName: true,
          },
        },
      },
    };

    const [students, total] = await Promise.all([
      this.prisma.student.findMany(options),
      this.prisma.student.count({ where: options.where }),
    ]);

    return createPaginatedData(
      students,
      total,
      Number(page ?? defaultPage),
      Number(limit ?? defaultLimit),
    );
  }

  async findAvailableStudentsForUser(query: StudentFilterDto) {
    const {
      limit = DefaultPaginaitonValue.limit,
      page = DefaultPaginaitonValue.page,
      orderBy = DefaultPaginaitonValue.orderBy,
      sort = DefaultPaginaitonValue.sortBy,
    } = query || {};

    const options: Prisma.studentFindManyArgs = {
      where: {
        user: { is: null },
      },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        [(sort === '' ? 'id' : sort) ?? 'id']: orderBy as Prisma.SortOrder,
      },
    };

    const result = this.prisma.student.findMany(options);

    const total = this.prisma.student.count({
      where: {
        user: { is: null },
      },
    });

    const response = await Promise.all([result, total]);

    return createPaginatedData(
      response[0],
      response[1],
      Number(page),
      Number(limit),
    );
  }

  // get exist student year from code like 65160123, 66160123, 67160123 => [65, 66, 67]
  async getExistYearFromCode(
    facultyId: number,
    branchId: number,
    curriculumCode: string,
  ): Promise<string[]> {
    const where: Prisma.studentWhereInput = {
      ...(curriculumCode && { curriculum: { code: curriculumCode } }),
      ...(branchId > 0 && { branchId }),
      ...(facultyId > 0 && { branch: { facultyId } }),
    };

    const codes = await this.prisma.student.findMany({
      where,
      select: {
        code: true,
      },
    });

    // slice code to year
    const slice = codes.map((code) => code.code.slice(0, 2));
    // remove duplicate
    const uniqueCodes = [...new Set(slice.map((item) => '25' + item))];
    return uniqueCodes;
  }
  // Find students by a list of IDs
  async findManyByCode(studentListCode: string[]) {
    return await this.prisma.student.findMany({
      where: {
        code: { in: studentListCode },
      },
    });
  }

  async findMissingData(pag: StudentFilterDto) {
    const whereCondition = {
      OR: [
        { thaiName: null },
        { engName: null },
        { branchId: null },
        { curriculumId: null },
      ],
    };

    const students = this.prisma.student.findMany({
      where: whereCondition,
      take: pag?.limit || 10,
      skip: ((pag?.page || 1) - 1) * (pag?.limit || 10),
      orderBy: { id: pag?.orderBy || 'asc' },
      include: {
        branch: {
          select: {
            thaiName: true,
            engName: true,
          },
        },
        curriculum: {
          select: {
            thaiName: true,
            engName: true,
            code: true,
          },
        },
      },
    });

    const total = this.prisma.student.count({
      where: whereCondition,
    });

    return Promise.all([students, total]).then(([students, total]) => {
      return createPaginatedData(
        students,
        total,
        pag?.page || 1,
        pag?.limit || 10,
      );
    });
  }

  // Get a student by ID
  async findOne(code: string) {
    const student = await this.prisma.student.findUnique({
      where: { code },
      include: {
        skill_collections: true,
        branch: {
          select: {
            thaiName: true,
            engName: true,
          },
        },
        curriculum: {
          select: {
            thaiName: true,
            engName: true,
            code: true,
          },
        },
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
    // 1) Ensure student exists with a bit of context
    const existing = await this.prisma.student.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        thaiName: true,
        engName: true,
      },
    });
    if (!existing) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // 2) Check FK blockers from skill_collection (onDelete: Restrict)
    const skillCollectionCount = await this.prisma.skill_collection.count({
      where: { studentId: id },
    });

    if (skillCollectionCount > 0) {
      const blocking = await this.prisma.skill_collection.findMany({
        where: { studentId: id },
        select: {
          id: true,
          clo: {
            select: {
              id: true,
              subject: {
                select: { code: true, thaiName: true, engName: true },
              },
            },
          },
          course: {
            select: {
              id: true,
              year: true,
              semester: true,
              subject: { select: { code: true, thaiName: true, engName: true } },
            },
          },
        },
        take: 10,
      });

      const displayName = existing.code || existing.thaiName || existing.engName || `Student #${id}`;

      throw new ConflictException({
        code: AppErrorCode.FK_CONFLICT,
        message: `Cannot delete Student "${displayName}" because there are Skill Collections referencing it.`,
        entity: 'Student',
        entityName: displayName,
        id,
        blockers: [
          {
            relation: 'SkillCollection',
            count: skillCollectionCount,
            field: 'studentId',
            entities: blocking.map((b) => ({
              id: b.id,
              name:
                b.course?.subject?.code
                  ? `${b.course.subject.code} - ${b.course.subject.thaiName || b.course.subject.engName || ''}`.trim()
                  : b.clo?.subject?.code
                  ? `${b.clo.subject.code} - ${b.clo.subject.thaiName || b.clo.subject.engName || ''}`.trim()
                  : `SkillCollection #${b.id}`,
            })),
          },
        ],
        suggestions: [
          'Delete skill collections for this student first.',
          'Or detach references if business rules allow before deleting the student.',
        ],
      });
    }

    // 3) Safe to delete
    const student = await this.prisma.student.delete({ where: { id } });
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

    return createPaginatedData(
      students,
      total,
      Number(page ?? defaultPage),
      Number(limit ?? defaultLimit),
    );
  }

  async createSkillAssessments(studentId: number, skillIds: number[]) {
    const skillAssessments = skillIds.map((skillId) => ({
      studentId,
      skillId,
      curriculumLevel: 0,
      companyLevel: 0,
      finalLevel: 0,
    }));

    await this.prisma.skill_assessment.createMany({
      data: skillAssessments,
    });
  }
}
