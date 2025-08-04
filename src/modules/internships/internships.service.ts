import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInternshipWithStudentDto } from './dto/create.dto';
import { BaseFilterParams } from 'src/dto/filters/filter.base.dto';
import { randomBytes } from 'crypto';

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
  async findAllPagination(filter: BaseFilterParams, year?: number) {
    const { search, page = 1, limit = 10 } = filter;

    const where = {
      year: year || undefined,
      company: {
        name: {
          contains: search,
        },
      },
    };

    const data = await this.prisma.internship.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        company: { select: { name: true } },
        studentInternships: {
          select: {
            student: { select: { id: true, code: true, thaiName: true } },
            jobPosition: { select: { id: true, name: true } },
          },
        },
      },
    });

    const total = Math.ceil(
      await this.prisma.internship.count({
        where,
      }),
    );

    return {
      data,
      meta: {
        total: total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  findOne(id: number) {
    // หา internship ด้วย id สําหรับ หลักสูตร
    return this.prisma.internship.findUnique({
      where: { id },
      include: {
        studentInternships: { include: { student: true } },
        company: { include: { company_job_positions: true } },
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
        studentInternships: {
          select: {
            id: true,
            student: {
              select: {
                code: true,
                thaiName: true,
                branch: { select: { thaiName: true } },
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
}
