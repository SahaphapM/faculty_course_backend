import { Test, TestingModule } from '@nestjs/testing';
import { SkillAssessmentsService } from './skill-assessments.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { createPrismaMock } from 'src/test-utils/prisma.mock';
import { BadRequestException } from '@nestjs/common';

describe('SkillAssessmentsService', () => {
  let service: SkillAssessmentsService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillAssessmentsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SkillAssessmentsService>(SkillAssessmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('companyAssessment', () => {
    it('updates skill assessment when student is not already assessed', async () => {
      const skillAssessmentId = 1;
      const studentInternshipId = 1;
      const updateDto = {
        companyLevel: 4,
        companyComment: 'Good performance',
      };

      const studentInternship = {
        id: 1,
        isAssessed: false,
      };

      const updatedAssessment = {
        id: 1,
        skillId: 1,
        studentId: 1,
        companyLevel: 4,
        companyComment: 'Good performance',
      };

      prisma.student_internship.findUnique.mockResolvedValue(studentInternship);
      prisma.skill_assessment.update.mockResolvedValue(updatedAssessment);

      const result = await service.companyAssessment(
        skillAssessmentId,
        studentInternshipId,
        updateDto,
      );

      expect(prisma.student_internship.findUnique).toHaveBeenCalledWith({
        where: { id: studentInternshipId },
        select: { isAssessed: true },
      });
      expect(prisma.skill_assessment.update).toHaveBeenCalledWith({
        where: { id: skillAssessmentId },
        data: {
          companyLevel: updateDto.companyLevel,
          companyComment: updateDto.companyComment,
        },
      });
      expect(result).toEqual(updatedAssessment);
    });

    it('throws BadRequestException when student is already assessed', async () => {
      const skillAssessmentId = 1;
      const studentInternshipId = 1;
      const updateDto = {
        companyLevel: 4,
        companyComment: 'Good performance',
      };

      const studentInternship = {
        id: 1,
        isAssessed: true,
      };

      prisma.student_internship.findUnique.mockResolvedValue(studentInternship);

      await expect(
        service.companyAssessment(
          skillAssessmentId,
          studentInternshipId,
          updateDto,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.skill_assessment.update).not.toHaveBeenCalled();
    });
  });

  describe('companySubmitAssessment', () => {
    it('updates all student internships to assessed status', async () => {
      const internshipId = 5;
      const updateResult = { count: 3 };

      prisma.student_internship.updateMany.mockResolvedValue(updateResult);

      const result = await service.companySubmitAssessment(internshipId);

      expect(prisma.student_internship.updateMany).toHaveBeenCalledWith({
        where: { internshipId },
        data: { isAssessed: true },
      });
      expect(result).toEqual(updateResult);
    });
  });

  describe('curriculumFinalAssessment', () => {
    it('updates skill assessment with final level and curriculum comment', async () => {
      const skillAssessmentId = 1;
      const updateDto = {
        finalLevel: 5,
        curriculumComment: 'Excellent progress',
      };

      const updatedAssessment = {
        id: 1,
        skillId: 1,
        studentId: 1,
        finalLevel: 5,
        curriculumComment: 'Excellent progress',
      };

      // Mock console.log to avoid output during tests
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      prisma.skill_assessment.update.mockResolvedValue(updatedAssessment);

      const result = await service.curriculumFinalAssessment(
        skillAssessmentId,
        updateDto,
      );

      expect(consoleSpy).toHaveBeenCalledWith('Backend received update:', {
        skillAssessmentId,
        finalLevel: updateDto.finalLevel,
        curriculumComment: updateDto.curriculumComment,
        fullDto: updateDto,
      });
      expect(prisma.skill_assessment.update).toHaveBeenCalledWith({
        where: { id: skillAssessmentId },
        data: {
          finalLevel: updateDto.finalLevel,
          curriculumComment: updateDto.curriculumComment,
        },
      });
      expect(result).toEqual(updatedAssessment);

      consoleSpy.mockRestore();
    });
  });

  describe('getStudentSkillAssessments', () => {
    it('returns formatted skill assessments for a student', async () => {
      const studentId = 1;
      const skillAssessments = [
        {
          id: 1,
          skillId: 1,
          studentId: 1,
          curriculumLevel: 3,
          companyLevel: 4,
          finalLevel: 4,
          curriculumComment: 'Good understanding',
          companyComment: 'Performs well',
          skill: {
            id: 1,
            thaiName: 'การเขียนโปรแกรม',
          },
        },
        {
          id: 2,
          skillId: 2,
          studentId: 1,
          curriculumLevel: 2,
          companyLevel: null,
          finalLevel: null,
          curriculumComment: 'Needs improvement',
          companyComment: null,
          skill: {
            id: 2,
            thaiName: 'การสื่อสาร',
          },
        },
      ];

      prisma.skill_assessment.findMany.mockResolvedValue(skillAssessments);

      const result = await service.getStudentSkillAssessments(studentId);

      expect(prisma.skill_assessment.findMany).toHaveBeenCalledWith({
        where: { studentId },
        include: {
          skill: {
            select: {
              id: true,
              thaiName: true,
            },
          },
        },
      });

      expect(result).toEqual([
        {
          id: 1,
          skillId: 1,
          skillName: 'การเขียนโปรแกรม',
          curriculumLevel: 3,
          companyLevel: 4,
          finalLevel: 4,
          curriculumComment: 'Good understanding',
          companyComment: 'Performs well',
        },
        {
          id: 2,
          skillId: 2,
          skillName: 'การสื่อสาร',
          curriculumLevel: 2,
          companyLevel: 0,
          finalLevel: 0,
          curriculumComment: 'Needs improvement',
          companyComment: '',
        },
      ]);
    });

    it('handles skill assessments with null skill reference', async () => {
      const studentId = 1;
      const skillAssessments = [
        {
          id: 1,
          skillId: 1,
          studentId: 1,
          curriculumLevel: 3,
          companyLevel: 4,
          finalLevel: 4,
          curriculumComment: 'Good understanding',
          companyComment: 'Performs well',
          skill: null,
        },
      ];

      prisma.skill_assessment.findMany.mockResolvedValue(skillAssessments);

      const result = await service.getStudentSkillAssessments(studentId);

      expect(result).toEqual([
        {
          id: 1,
          skillId: 1,
          skillName: '',
          curriculumLevel: 3,
          companyLevel: 4,
          finalLevel: 4,
          curriculumComment: 'Good understanding',
          companyComment: 'Performs well',
        },
      ]);
    });

    it('returns empty array when no assessments found', async () => {
      const studentId = 999;

      prisma.skill_assessment.findMany.mockResolvedValue([]);

      const result = await service.getStudentSkillAssessments(studentId);

      expect(result).toEqual([]);
    });
  });
});
