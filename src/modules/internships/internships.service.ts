import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInternshipWithStudentDto } from './dto/create.dto';
import { BaseFilterParams } from 'src/dto/filters/filter.base.dto';

@Injectable()
export class InternshipsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createInternshipDto: CreateInternshipWithStudentDto) {
    const { studentInternships, companyId, ...rest } = createInternshipDto;

    // First create the internship
    const internship = await this.prisma.internship.create({
      data: {
        ...rest,
        company: {
          connect: { id: companyId },
        },
      },
    });

    // Then create the student_internship relations
    await this.prisma.student_internship.createMany({
      data: studentInternships.map((student) => ({
        studentId: student.studentId,
        internshipId: internship.id,
        jobPositionId: student.jobPositionId,
      })),
    });

    // Finally, fetch the complete internship with its relations
    const result = await this.prisma.internship.findUnique({
      where: { id: internship.id },
      include: {
        studentInternships: true,
        company: true,
      },
    });

    return result;
  }

  // findAll pagination
  async findAllPagination(filter: BaseFilterParams, year?: number) {
    const { search, page = 1, limit = 10 } = filter;

    const where = {
      year: year ? year : undefined,
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
      include: { company: true, studentInternships: true },
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
    const { studentInternships = [], companyId, ...rest } = updateInternshipDto;

    // First, update the internship details
    await this.prisma.internship.update({
      where: { id },
      data: {
        ...rest,
        ...(companyId && {
          company: {
            connect: { id: companyId },
          },
        }),
      },
    });

    // Get current student internships
    const currentStudentInternships =
      await this.prisma.student_internship.findMany({
        where: { internshipId: id },
        select: { studentId: true, id: true },
      });

    // Extract student IDs from current and new relationships
    const currentStudentIds = currentStudentInternships.map(
      (si) => si.studentId,
    );
    const newStudentIds = studentInternships.map((si) => si.studentId);

    // Find relationships to delete (in current but not in new)
    const toDelete = currentStudentInternships.filter(
      (si) => !newStudentIds.includes(si.studentId),
    );

    // Find student IDs to add (in new but not in current)
    const toAdd = studentInternships.filter(
      (si) => !currentStudentIds.includes(si.studentId),
    );

    // Find student IDs to update (in both current and new)
    const toUpdate = studentInternships.filter((si) =>
      currentStudentIds.includes(si.studentId),
    );

    // Delete relationships that are no longer needed
    if (toDelete.length > 0) {
      await this.prisma.student_internship.deleteMany({
        where: {
          id: { in: toDelete.map((si) => si.id) },
        },
      });
    }

    // Add new relationships
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

    // Update existing relationships (like jobPosition changes)
    if (toUpdate.length > 0) {
      await Promise.all(
        toUpdate.map((si) =>
          this.prisma.student_internship.updateMany({
            where: {
              studentId: si.studentId,
              internshipId: id,
            },
            data: {
              jobPositionId: si.jobPositionId,
            },
          }),
        ),
      );
    }

    // Finally, fetch and return the updated internship with its relations
    return this.prisma.internship.findUnique({
      where: { id },
      include: {
        studentInternships: true,
        company: true,
      },
    });
  }

  remove(id: number) {
    return this.prisma.internship.delete({ where: { id } });
  }
}
