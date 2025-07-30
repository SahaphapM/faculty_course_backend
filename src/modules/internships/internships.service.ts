import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInternshipWithStudentDto } from './dto/create.dto';
import { BaseFilterParams } from 'src/dto/filters/filter.base.dto';
import {
  createSkillAssessments,
  getSkillsByStudent,
} from './internships.helper';
import { UpdateSkillAssessmentDto } from 'src/generated/nestjs-dto/update-skillAssessment.dto';

@Injectable()
export class InternshipsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInternshipDto: CreateInternshipWithStudentDto) {
    const { studentInternships, companyId, ...rest } = createInternshipDto;

    const internship = await this.prisma.internship.create({
      data: {
        ...rest,
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

    const savedStudentInternships =
      await this.prisma.student_internship.findMany({
        where: { internshipId: internship.id },
      });

    const skills = await getSkillsByStudent(
      studentInternships[0].studentId,
      this.prisma,
    );
    await createSkillAssessments(savedStudentInternships, skills, this.prisma);

    return this.prisma.internship.findUnique({
      where: { id: internship.id },
      include: {
        studentInternships: {
          include: { student: true, jobPosition: true, skillAssessments: true },
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
        studentInternships: { select: { studentId: true } },
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

    await this.prisma.internship.update({
      where: { id },
      data: {
        ...rest,
        ...(companyId && { company: { connect: { id: companyId } } }),
      },
    });

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
      await this.prisma.skill_assessment.deleteMany({
        where: { studentInternshipId: { in: toDelete.map((si) => si.id) } },
      });
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

      const savedStudentInternships =
        await this.prisma.student_internship.findMany({
          where: { internshipId: id },
        });

      const skills = await getSkillsByStudent(toAdd[0].studentId, this.prisma);
      await createSkillAssessments(
        savedStudentInternships,
        skills,
        this.prisma,
      );
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
      include: { studentInternships: true, company: true },
    });
  }

  async remove(id: number) {
    // delete student_internship
    // delete skill_assessment
    // delete internship

    // await this.prisma.student_internship.deleteMany({
    //   where: { internshipId: id },
    // });
    // await this.prisma.skill_assessment.deleteMany({
    //   where: { studentInternshipId: { in: toDelete.map((si) => si.id) } },
    // });
    await this.prisma.internship.delete({
      where: { id },
    });
  }

  skillAssessment(internshipId: number) {
    return this.prisma.internship.findUnique({
      where: { id: internshipId },
      include: {
        studentInternships: {
          include: {
            jobPosition: {
              select: {
                name: true,
              },
            },
            student: {
              select: {
                id: true,
                code: true,
                thaiName: true,
                branch: { select: { id: true, thaiName: true } },
              },
            },
          },
        },
        company: { select: { name: true } },
      },
    });
  }

  getStudentAssessment(internshipId: number, studentId: number) {
    /// get student assessment by internship id and student id
    return this.prisma.student_internship.findFirst({
      where: { internshipId, studentId },
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
                faculty: { select: { thaiName: true } },
              },
            },
            curriculum: { select: { thaiName: true } },
          },
        },
        skillAssessments: {
          include: {
            skill: { select: { thaiName: true, thaiDescription: true } },
          },
        },
      },
    });
  }

  updateSkillAssessment(
    skillAssessmentId: number,
    updateSkillAssessmentDto: UpdateSkillAssessmentDto,
  ) {
    return this.prisma.skill_assessment.update({
      where: { id: skillAssessmentId },
      data: { ...updateSkillAssessmentDto },
    });
  }
}
