import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateSkillAssessmentDto } from 'src/generated/nestjs-dto/update-skillAssessment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { SkillCollectionsHelper } from '../skill-collectiolns/skill-collectiolns.helper';

@Injectable()
export class SkillAssessmentsService {
  constructor(private readonly prisma: PrismaService,
    private readonly skHelper: SkillCollectionsHelper,
  ) { }



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

    console.log('Backend received update:', {
      skillAssessmentId,
      finalLevel,
      curriculumComment,
      fullDto: updateSkillAssessmentDto
    });

    return this.prisma.skill_assessment.update({
      where: { id: skillAssessmentId },
      data: { finalLevel, curriculumComment },
    });
  }

  async getStudentSkillAssessments(studentId: number) {

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        curriculumId: true,
        skill_collections: {
          select: {
            id: true,
            gainedLevel: true,
            clo: {
              select: {
                skill: {
                  select: {
                    id: true,
                    parentId: true,
                    engName: true,
                    domain: true,
                    thaiName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const rootSkills = await this.prisma.skill.findMany({
      where: { parent: null, curriculumId: student.curriculumId },
      select: {
        id: true,
        parentId: true,
        domain: true,
        thaiName: true,
        engName: true,
      },
    });

    

    this.skHelper.syncStudentSkillAssessments(student.id, rootSkills, student.skill_collections);


    const skillAssessments = await this.prisma.skill_assessment.findMany({
      where: { studentId },
      select: {
        id: true,
        skillId: true,
        skill: {
          select: {
            id: true,
            parentId: true,
            engName: true,
            domain: true,
            thaiName: true,
          },
        },
        curriculumLevel: true,
        companyLevel: true,
        finalLevel: true,
        curriculumComment: true,
        companyComment: true,
      },
    });

 
    return skillAssessments.map((assessment) => ({
      id: assessment.id,
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
