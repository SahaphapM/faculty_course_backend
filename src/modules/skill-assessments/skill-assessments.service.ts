import { Injectable } from '@nestjs/common';
import { UpdateSkillAssessmentDto } from 'src/generated/nestjs-dto/update-skillAssessment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class SkillAssessmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAssessmentByStudent(internshipId: number, studentCode: string) {
    const student = await this.prisma.student.findUnique({
      where: { code: studentCode },
    });

    if (!student) {
      throw new BadRequestException('Student not found');
    }

    /// get student assessment by internship id and student id
    const studentInternship = await this.prisma.student_internship.findFirst({
      where: { internshipId, studentId: student.id },
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
            skill_assessments: {
              include: {
                skill: { select: { thaiName: true, thaiDescription: true } },
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

  async companyAssessment(
    skillAssessmentId: number,
    studentInternshipId: number,
    updateSkillAssessmentDto: UpdateSkillAssessmentDto,
  ) {
    const { companyLevel, companyComment } = updateSkillAssessmentDto;

    const studentInternship = await this.prisma.student_internship.findUnique({
      where: { id: studentInternshipId },
      select: {
        isAssessed: true,
      },
    });

    if (studentInternship.isAssessed) {
      throw new BadRequestException('Student is already assessed');
    }

    return this.prisma.skill_assessment.update({
      where: { id: skillAssessmentId },
      data: { companyLevel, companyComment },
    });
  }

  companySubmitAssessment(internshipId: number) {
    // ทำการเปลี่ยนสถานะ isAssessed เป็น true เมื่อประเมินเสร็จสิ้น ป้องกัน company ประเมินซ้ำ
    return this.prisma.student_internship.updateMany({
      where: { internshipId },
      data: { isAssessed: true },
    });
  }

  curriculumFinalAssessment(
    // ประเมินจากหลักสูตร
    skillAssessmentId: number,
    updateSkillAssessmentDto: UpdateSkillAssessmentDto,
  ) {
    const { finalLevel, curriculumComment } = updateSkillAssessmentDto;

    return this.prisma.skill_assessment.update({
      where: { id: skillAssessmentId },
      data: { finalLevel, curriculumComment },
    });
  }

  async getStudentSkillAssessments(studentId: number) {
    // const student = await this.prisma.student.findUnique({
    //   where: { id: studentId },
    // });
    // console.log(student);

    // if (!student) {
    //   throw new BadRequestException('Student not found');
    // }

    const skillAssessments = await this.prisma.skill_assessment.findMany({
      where: { studentId: studentId },
      include: {
        skill: {
          select: {
            id: true,
            thaiName: true,
          },
        },
      },
    });

    return skillAssessments.map((assessment) => ({
      skillAssessmentId: assessment.id,
      skillId: assessment.skillId,
      skillName: assessment.skill?.thaiName || '',
      curriculumLevel: assessment.curriculumLevel || 0,
      companyLevel: assessment.companyLevel || 0,
      finalLevel: assessment.finalLevel || 0,
      curriculumComment: assessment.curriculumComment || '',
      companyComment: assessment.companyComment || '',
    }));
  }
}
