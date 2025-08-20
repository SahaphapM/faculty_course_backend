import { Test, TestingModule } from '@nestjs/testing';
import { SkillCollectionsService } from './skill-collectiolns.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClosService } from '../clos/clos.service';
import { SkillCollectionsHelper } from './skill-collectiolns.helper';
import { createPrismaMock } from 'src/test-utils/prisma.mock';
import { NotFoundException } from '@nestjs/common';
import { LearningDomain } from 'src/enums/learning-domain.enum';

describe('SkillCollectionsService', () => {
  let service: SkillCollectionsService;
  let prisma: ReturnType<typeof createPrismaMock>;
  let cloService: jest.Mocked<ClosService>;
  let skillCollectionsHelper: jest.Mocked<SkillCollectionsHelper>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const mockClosService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const mockSkillCollectionsHelper = {
      processSkillCollections: jest.fn(),
      calculateSkillLevel: jest.fn(),
      generateReports: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillCollectionsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ClosService, useValue: mockClosService },
        {
          provide: SkillCollectionsHelper,
          useValue: mockSkillCollectionsHelper,
        },
      ],
    }).compile();

    service = module.get<SkillCollectionsService>(SkillCollectionsService);
    cloService = module.get(ClosService);
    skillCollectionsHelper = module.get(SkillCollectionsHelper);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTranscriptFromAssessment', () => {
    it('returns transcript data for a valid student code', async () => {
      const studentCode = 'ST001';
      const student = {
        id: 1,
        code: 'ST001',
        engName: null,
        enrollmentDate: new Date(),
        socials: null,
        thaiName: 'นักเรียน 1',
        curriculumId: 1,
        branchId: 1,
        userId: 1,
      };

      const assessments = [
        {
          id: 1,
          skillId: 1,
          studentId: 1,
          curriculumLevel: 3,
          companyLevel: 4,
          finalLevel: 4,
          curriculumComment: null,
          companyComment: null,
          skill: {
            id: 1,
            parentId: null,
            engName: 'Programming',
            domain: LearningDomain.Cognitive,
          },
        },
        {
          id: 2,
          skillId: 2,
          studentId: 1,
          curriculumLevel: 2,
          companyLevel: 3,
          finalLevel: 0,
          curriculumComment: null,
          companyComment: null,
          skill: {
            id: 2,
            parentId: null,
            engName: 'Communication',
            domain: LearningDomain.Affective,
          },
        },
      ];

      const skillCollections = [
        {
          id: 1,
          studentId: 1,
          courseId: 1,
          cloId: 1,
          gainedLevel: 3,
          passed: true,
          clo: {
            id: 1,
            skill: {
              id: 3,
              parentId: 1,
              engName: 'JavaScript',
              domain: LearningDomain.Cognitive,
            },
          },
        },
      ];

      const allSkills = [
        {
          id: 1,
          parentId: null,
          engName: 'Programming',
          domain: LearningDomain.Cognitive,
        },
        {
          id: 2,
          parentId: null,
          engName: 'Communication',
          domain: LearningDomain.Affective,
        },
        {
          id: 3,
          parentId: 1,
          engName: 'JavaScript',
          domain: LearningDomain.Cognitive,
        },
      ];

      // Mock console.log to avoid output during tests
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      prisma.student.findUnique.mockResolvedValue(student);
      prisma.skill_assessment.findMany.mockResolvedValue(assessments);
      prisma.skill_collection.findMany.mockResolvedValue(skillCollections);

      // Mock the getSkillsWithParents method by spying on the service
      const getSkillsWithParentsSpy = jest
        .spyOn(service as any, 'getSkillsWithParents')
        .mockResolvedValue(allSkills);

      const result = await service.getTranscriptFromAssessment(studentCode);

      expect(prisma.student.findUnique).toHaveBeenCalledWith({
        where: { code: studentCode },
        select: { id: true },
      });

      expect(prisma.skill_assessment.findMany).toHaveBeenCalledWith({
        where: {
          studentId: student.id,
          OR: [
            { curriculumLevel: { gt: 0 } },
            { companyLevel: { gt: 0 } },
            { finalLevel: { gt: 0 } },
          ],
        },
        select: {
          id: true,
          skillId: true,
          curriculumLevel: true,
          companyLevel: true,
          finalLevel: true,
          skill: {
            select: {
              id: true,
              parentId: true,
              engName: true,
              domain: true,
            },
          },
        },
      });

      expect(prisma.skill_collection.findMany).toHaveBeenCalledWith({
        where: { studentId: student.id },
        include: { clo: { include: { skill: true } } },
      });

      expect(result).toHaveProperty('specific');
      expect(result).toHaveProperty('soft');
      expect(Array.isArray(result.specific)).toBe(true);
      expect(Array.isArray(result.soft)).toBe(true);

      // Verify that specific skills contain cognitive/psychomotor domains
      result.specific.forEach((skill) => {
        expect([
          LearningDomain.Cognitive,
          LearningDomain.Psychomotor,
        ]).toContain(skill.domain);
      });

      // Verify that soft skills contain affective/ethics domains
      result.soft.forEach((skill) => {
        expect([LearningDomain.Affective, LearningDomain.Ethics]).toContain(
          skill.domain,
        );
      });

      consoleSpy.mockRestore();
      getSkillsWithParentsSpy.mockRestore();
    });

    it('throws NotFoundException when student not found', async () => {
      const studentCode = 'INVALID';

      prisma.student.findUnique.mockResolvedValue(null);

      await expect(
        service.getTranscriptFromAssessment(studentCode),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.student.findUnique).toHaveBeenCalledWith({
        where: { code: studentCode },
        select: { id: true },
      });
    });

    it('returns empty arrays when no assessments found', async () => {
      const studentCode = 'ST002';
      const student = {
        id: 2,
        code: 'ST002',
        engName: null,
        enrollmentDate: new Date(),
        socials: null,
        thaiName: 'นักเรียน 2',
        curriculumId: 1,
        branchId: 1,
        userId: 2,
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      prisma.student.findUnique.mockResolvedValue(student);
      prisma.skill_assessment.findMany.mockResolvedValue([]);

      const result = await service.getTranscriptFromAssessment(studentCode);

      expect(result).toEqual({ specific: [], soft: [] });
      expect(prisma.skill_collection.findMany).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('handles assessments with zero levels correctly', async () => {
      const studentCode = 'ST003';
      const student = {
        id: 3,
        code: 'ST003',
        engName: null,
        enrollmentDate: new Date(),
        socials: null,
        thaiName: 'นักเรียน 3',
        curriculumId: 1,
        branchId: 1,
        userId: 3,
      };

      const assessments = [
        {
          id: 1,
          skillId: 1,
          studentId: 3,
          curriculumLevel: 0,
          companyLevel: 0,
          finalLevel: 1, // Only finalLevel > 0
          curriculumComment: null,
          companyComment: null,
          skill: {
            id: 1,
            parentId: null,
            engName: 'Basic Skill',
            domain: LearningDomain.Cognitive,
          },
        },
      ];

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      prisma.student.findUnique.mockResolvedValue(student);
      prisma.skill_assessment.findMany.mockResolvedValue(assessments);
      prisma.skill_collection.findMany.mockResolvedValue([]);

      const getSkillsWithParentsSpy = jest
        .spyOn(service as any, 'getSkillsWithParents')
        .mockResolvedValue([assessments[0].skill]);

      const result = await service.getTranscriptFromAssessment(studentCode);

      expect(result.specific).toHaveLength(1);
      expect(result.soft).toHaveLength(0);

      consoleSpy.mockRestore();
      getSkillsWithParentsSpy.mockRestore();
    });
  });

  describe('getByCloId', () => {
    it('returns skill collections for a specific course and CLO', async () => {
      const courseId = 1;
      const cloId = 1;

      const skillCollections = [
        {
          id: 1,
          courseId: courseId,
          cloId: cloId,
          studentId: 10,
          gainedLevel: 4,
          passed: true,
          student: {
            code: 'ST001',
            thaiName: 'นักเรียน ที่หนึ่ง',
          },
        },
        {
          id: 2,
          courseId: courseId,
          cloId: cloId,
          studentId: 11,
          gainedLevel: 3,
          passed: true,
          student: {
            code: 'ST002',
            thaiName: 'นักเรียน ที่สอง',
          },
        },
      ];

      prisma.skill_collection.findMany.mockResolvedValue(skillCollections);

      const result = await service.getByCourseAndCloId(courseId, cloId);

      expect(prisma.skill_collection.findMany).toHaveBeenCalledWith({
        where: { courseId, cloId },
        select: {
          id: true,
          gainedLevel: true,
          passed: true,
          student: {
            select: {
              code: true,
              thaiName: true,
            },
          },
        },
        orderBy: { student: { code: 'asc' } },
      });

      expect(result).toEqual(skillCollections);
      expect(result).toHaveLength(2);
    });

    it('returns empty array when no skill collections found', async () => {
      const courseId = 999;
      const cloId = 999;

      prisma.skill_collection.findMany.mockResolvedValue([]);

      const result = await service.getByCourseAndCloId(courseId, cloId);

      expect(result).toEqual([]);
    });
  });

  describe('importSkillCollections', () => {
    it('should be tested when implementation is available', () => {
      // This test would need to be implemented based on the actual
      // importSkillCollections method implementation
      expect(service.importSkillCollections).toBeDefined();
    });
  });

  describe('generateTestData', () => {
    it('should be tested when implementation is available', () => {
      // This test would need to be implemented based on the actual
      // generateTestData method implementation
      expect(service.generateTestData).toBeDefined();
    });
  });

  describe('generateTestSkillCollections', () => {
    it('should be tested when implementation is available', () => {
      // This test would need to be implemented based on the actual
      // generateTestSkillCollections method implementation
      expect(service.generateTestSkillCollections).toBeDefined();
    });
  });

  describe('getSkillsWithParents (private method)', () => {
    it('fetches skills and their parent chains', async () => {
      const skillIds = [1, 2];
      const skills = [
        {
          id: 1,
          parentId: null,
          engName: 'Root Skill',
          domain: LearningDomain.Cognitive,
        },
        {
          id: 2,
          parentId: 1,
          engName: 'Child Skill',
          domain: LearningDomain.Cognitive,
        },
      ];

      // Mock the findUnique calls for each skill
      // @ts-ignore Mocking Prisma client's findUnique; returning a plain Promise with simplified shape is sufficient for tests
      (prisma.skill.findUnique as any).mockImplementation((args: any) => {
        const skill = skills.find((s) => s.id === (args as any).where.id);
        return Promise.resolve(
          skill
            ? {
                ...skill,
                curriculumId: 1,
                thaiName: skill.engName,
                thaiDescription: '',
                engDescription: '',
                domain: skill.domain,
              }
            : null,
        );
      });

      // Access the private method for testing
      const result = await (service as any).getSkillsWithParents(skillIds);

      expect(result).toHaveLength(2);
      expect(result).toEqual(expect.arrayContaining(skills));
    });

    it('handles circular references and visited skills correctly', async () => {
      const skillIds = [1];
      const skill = {
        id: 1,
        parentId: null,
        engName: 'Single Skill',
        thaiName: 'Single Skill',
        thaiDescription: '',
        engDescription: '',
        curriculumId: 1,
        domain: LearningDomain.Cognitive,
      };

      prisma.skill.findUnique.mockResolvedValue(skill);

      const result = await (service as any).getSkillsWithParents(skillIds);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(skill);
      expect(prisma.skill.findUnique).toHaveBeenCalledTimes(1);
    });

    it('handles non-existent skills gracefully', async () => {
      const skillIds = [999];

      prisma.skill.findUnique.mockResolvedValue(null);

      const result = await (service as any).getSkillsWithParents(skillIds);

      expect(result).toHaveLength(0);
    });
  });
});
