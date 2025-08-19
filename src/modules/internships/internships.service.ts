import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInternshipWithStudentDto } from './dto/create-internship-with-student.dto';
import { BaseFilterParams } from 'src/dto/filters/filter.base.dto';
import { randomBytes } from 'crypto';
import { createPaginatedData } from 'src/utils/paginated.utils';

@Injectable()
export class InternshipsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInternshipDto: CreateInternshipWithStudentDto) {
    const { studentInternships, companyId, ...rest } = createInternshipDto;

    const token = randomBytes(16).toString('hex');

    const internship = await this.prisma.internship.create({
      data: {
        ...rest,
        token: token,
        company: { connect: { id: companyId } },
      },
    });

    await this.prisma.student_internship.createMany({
      data: studentInternships.map((student) => ({
        studentId: student.studentId,
        internshipId: internship.id,
        jobPositionId: student.jobPositionId,
      })),
      skipDuplicates: true,
    });

    return this.prisma.internship.findUnique({
      where: { id: internship.id },
      include: {
        studentInternships: {
          include: { student: true, jobPosition: true },
        },
        company: true,
      },
    });
  }

  // findAll pagination
  async findAllPagination(filter: BaseFilterParams, year?: string) {
    const { search, page = 1, limit = 10, sort, orderBy } = filter;

    const where = {
      ...(year !== undefined ? { year: Number(year) } : {}),
      ...(search ? { company: { name: { contains: search } } } : {}),
    };

    console.log(where);

    const data = await this.prisma.internship.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        company: { select: { name: true } },
        studentInternships: {
          select: {
            id: true,
            // student: { select: { id: true, code: true, thaiName: true } },
            // jobPosition: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { [sort || 'id']: orderBy || 'asc' },
    });

    const total = await this.prisma.internship.count({
      where,
    });

    return createPaginatedData(data, total, Number(page), Number(limit));
  }

  findOne(id: number) {
    // หา internship ด้วย id สําหรับ หลักสูตร
    return this.prisma.internship.findUnique({
      where: { id },
      include: {
        studentInternships: {
          include: { student: true, jobPosition: true },
        },
        company: {
          include: {
            company_job_positions: {
              select: {
                jobPosition: true,
              },
            },
          },
        },
      },
    });
  }

  getInternshipYear() {
    return this.prisma.internship.groupBy({
      by: ['year'],
      orderBy: {
        year: 'asc',
      },
    });
  }

  async update(
    id: number,
    updateInternshipDto: CreateInternshipWithStudentDto,
  ) {
    const { studentInternships, companyId, ...rest } = updateInternshipDto;

    await this.prisma.internship.update({
      where: { id },
      data: {
        ...rest,
        ...(companyId ? { company: { connect: { id: companyId } } } : {}),
      },
    });

    // Handle studentInternships updates only if provided
    if (!studentInternships || studentInternships.length === 0) {
      return this.prisma.internship.findUnique({
        where: { id },
        include: {
          studentInternships: {
            include: {
              student: true,
              jobPosition: true,
            },
          },
          company: true,
        },
      });
    }

    const currentStudentInternships =
      await this.prisma.student_internship.findMany({
        where: { internshipId: id },
        select: { studentId: true, id: true },
      });

    const currentStudentIds = currentStudentInternships.map(
      (si) => si.studentId,
    );
    const newStudentIds = studentInternships.map((si) => si.studentId);

    const toDelete = currentStudentInternships.filter(
      (si) => !newStudentIds.includes(si.studentId),
    );
    const toAdd = studentInternships.filter(
      (si) => !currentStudentIds.includes(si.studentId),
    );
    const toUpdate = studentInternships.filter((si) =>
      currentStudentIds.includes(si.studentId),
    );

    if (toDelete.length > 0) {
      await this.prisma.student_internship.deleteMany({
        where: { id: { in: toDelete.map((si) => si.id) } },
      });
    }

    if (toAdd.length > 0) {
      await this.prisma.student_internship.createMany({
        data: toAdd.map((si) => ({
          studentId: si.studentId,
          internshipId: id,
          jobPositionId: si.jobPositionId,
        })),
        skipDuplicates: true,
      });
    }

    if (toUpdate.length > 0) {
      await Promise.all(
        toUpdate.map((si) =>
          this.prisma.student_internship.updateMany({
            where: { studentId: si.studentId, internshipId: id },
            data: { jobPositionId: si.jobPositionId },
          }),
        ),
      );
    }

    return this.prisma.internship.findUnique({
      where: { id },
      include: {
        studentInternships: {
          include: {
            student: true,
            jobPosition: true,
          },
        },
        company: true,
      },
    });
  }

  async remove(id: number) {
    await this.prisma.internship.delete({
      where: { id },
    });
  }

  /////////////////////////////////// Company ///////////////////////////////////

  // หา internship ด้วย token สำหรับ company
  findOneByToken(token: string) {
    return this.prisma.internship.findUnique({
      where: { token: token },
      select: {
        year: true,
        token: true,
        studentInternships: {
          select: {
            id: true,
            isAssessed: true,
            student: {
              select: {
                code: true,
                thaiName: true,
                engName: true,
                branch: {
                  select: {
                    thaiName: true,
                    engName: true,
                    faculty: { select: { thaiName: true, engName: true } },
                  },
                },
              },
            },
            jobPosition: { select: { name: true } },
          },
        },
        company: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async getAssessmentByStudent(token: string, studentCode: string) {
    const student = await this.prisma.student.findUnique({
      where: { code: studentCode },
    });

    if (!student) {
      throw new BadRequestException('Student not found');
    }

    /// get student assessment by internship id and student id
    const studentInternship = await this.prisma.student_internship.findFirst({
      where: { internship: { token }, studentId: student.id },
      include: {
        jobPosition: {
          select: {
            name: true,
          },
        },
        student: {
          include: {
            branch: {
              select: {
                thaiName: true,
                engName: true,
                faculty: { select: { thaiName: true, engName: true } },
              },
            },
            curriculum: {
              select: {
                thaiName: true,
                engName: true,
                level_descriptions: true,
              },
            },
            skill_assessments: {
              include: {
                skill: {
                  select: { thaiName: true, engName: true, domain: true },
                },
              },
            },
          },
        },
        internship: {
          select: {
            year: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!studentInternship) {
      throw new BadRequestException('Student internship not found');
    }

    return studentInternship;
  }
}
