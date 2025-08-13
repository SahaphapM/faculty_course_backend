// Removed ts-nocheck to enforce type safety
import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from './courses.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { createPrismaMock } from 'src/test-utils/prisma.mock';
import {
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { makeCourse } from 'src/test-utils/factories/entity.factories';

describe('CourseService', () => {
  let service: CourseService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<CourseService>(CourseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll pagination', () => {
    it('returns paginated meta & data with default parameters', async () => {
      const fakeData = [
        makeCourse({ id: 1, year: 2024, semester: 1, active: true }),
        makeCourse({ id: 2, year: 2024, semester: 1, active: true }),
      ];

      prisma.course.findMany.mockResolvedValue(fakeData);
      prisma.course.count.mockResolvedValue(20);

      const result = await service.findAll();

      expect(prisma.course.findMany).toHaveBeenCalledWith({
        take: 16,
        skip: 0,
        orderBy: { id: 'asc' },
        where: {},
        include: { subject: true },
      });
      expect(prisma.course.count).toHaveBeenCalledWith({ where: {} });

      expect(result.data).toHaveLength(2);
      expect(result.meta).toEqual({
        total: 20,
        page: 1,
        limit: 16,
        totalPages: 2,
      });
    });

    it('returns paginated data with custom page and limit', async () => {
      const page = 2;
      const limit = 8;

      const fakeData: any = Array.from({ length: limit }).map((_, i) => ({
        id: i + 9, // Page 2 starts at item 9
        year: 2024,
        semester: 1,
        active: true,
        subjectId: i + 9,
        subject: {
          id: i + 9,
          thaiName: `วิชา${i + 9}`,
          engName: `Subject${i + 9}`,
          code: `SUB00${i + 9}`,
        },
      }));

      prisma.course.findMany.mockResolvedValue(fakeData);
      prisma.course.count.mockResolvedValue(30);

      const result = await service.findAll({ page, limit });

      expect(prisma.course.findMany).toHaveBeenCalledWith({
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { id: 'asc' },
        where: {},
        include: { subject: true },
      });

      expect(result.data).toHaveLength(limit);
      expect(result.meta).toEqual({
        total: 30,
        page,
        limit,
        totalPages: Math.ceil(30 / limit),
      });
    });

    it('filters by nameCode (searches subject name and code)', async () => {
      const nameCode = 'วิศวกรรม';
      const fakeData: any = [
        {
          id: 1,
          year: 2024,
          semester: 1,
          active: true,
          subjectId: 1,
          subject: {
            id: 1,
            thaiName: 'วิศวกรรมคอมพิวเตอร์',
            engName: 'Computer Engineering',
            code: 'CE001',
          },
        },
      ];

      prisma.course.findMany.mockResolvedValue(fakeData);
      prisma.course.count.mockResolvedValue(1);

      const result = await service.findAll({ nameCode });

      expect(prisma.course.findMany).toHaveBeenCalledWith({
        take: 16,
        skip: 0,
        orderBy: { id: 'asc' },
        where: {
          OR: [
            { subject: { thaiName: { contains: nameCode } } },
            { subject: { engName: { contains: nameCode } } },
            { subject: { code: { contains: nameCode } } },
          ],
        },
        include: { subject: true },
      });

      expect(result.data).toHaveLength(1);
      expect((result.data as any)[0].subject.thaiName).toContain('วิศวกรรม');
    });

    it('filters by active status', async () => {
      const fakeData: any = [
        {
          id: 1,
          year: 2024,
          semester: 1,
          active: true,
          subjectId: 1,
          subject: {
            id: 1,
            thaiName: 'วิชาA',
            engName: 'Subject A',
            code: 'SUB001',
          },
        },
      ];

      prisma.course.findMany.mockResolvedValue(fakeData);
      prisma.course.count.mockResolvedValue(1);

      const result = await service.findAll({ active: true });

      expect(prisma.course.findMany).toHaveBeenCalledWith({
        take: 16,
        skip: 0,
        orderBy: { id: 'asc' },
        where: { active: true },
        include: { subject: true },
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].active).toBe(true);
    });

    it('filters by years array', async () => {
      const years = [2023, 2024];
      const fakeData: any = [
        {
          id: 1,
          year: 2023,
          semester: 1,
          active: true,
          subjectId: 1,
          subject: {
            id: 1,
            thaiName: 'วิชาA',
            engName: 'Subject A',
            code: 'SUB001',
          },
        },
        {
          id: 2,
          year: 2024,
          semester: 1,
          active: true,
          subjectId: 2,
          subject: {
            id: 2,
            thaiName: 'วิชาB',
            engName: 'Subject B',
            code: 'SUB002',
          },
        },
      ];

      prisma.course.findMany.mockResolvedValue(fakeData);
      prisma.course.count.mockResolvedValue(2);

      const result = await service.findAll({ years });

      expect(prisma.course.findMany).toHaveBeenCalledWith({
        take: 16,
        skip: 0,
        orderBy: { id: 'asc' },
        where: {
          OR: [{ year: Number(years[0]) }, { year: Number(years[1]) }],
        },
        include: { subject: true },
      });

      expect(result.data).toHaveLength(2);
    });

    it('filters by semesters array', async () => {
      const semesters = [1, 2];
      const fakeData: any = [
        {
          id: 1,
          year: 2024,
          semester: 1,
          active: true,
          subjectId: 1,
          subject: {
            id: 1,
            thaiName: 'วิชาA',
            engName: 'Subject A',
            code: 'SUB001',
          },
        },
      ];

      prisma.course.findMany.mockResolvedValue(fakeData);
      prisma.course.count.mockResolvedValue(1);

      const result = await service.findAll({ semesters });

      expect(prisma.course.findMany).toHaveBeenCalledWith({
        take: 16,
        skip: 0,
        orderBy: { id: 'asc' },
        where: {
          OR: [
            { semester: Number(semesters[0]) },
            { semester: Number(semesters[1]) },
          ],
        },
        include: { subject: true },
      });

      expect(result.data).toHaveLength(1);
    });

    it('applies custom sorting', async () => {
      const fakeData: any = [
        {
          id: 2,
          year: 2024,
          semester: 2,
          active: true,
          subjectId: 2,
          subject: {
            id: 2,
            thaiName: 'วิชาB',
            engName: 'Subject B',
            code: 'SUB002',
          },
        },
        {
          id: 1,
          year: 2024,
          semester: 1,
          active: true,
          subjectId: 1,
          subject: {
            id: 1,
            thaiName: 'วิชาA',
            engName: 'Subject A',
            code: 'SUB001',
          },
        },
      ];

      prisma.course.findMany.mockResolvedValue(fakeData);
      prisma.course.count.mockResolvedValue(2);

      const result = await service.findAll({
        sort: 'semester',
        orderBy: 'desc',
      });

      expect(prisma.course.findMany).toHaveBeenCalledWith({
        take: 16,
        skip: 0,
        orderBy: { semester: 'desc' },
        where: {},
        include: { subject: true },
      });

      expect(result.data).toHaveLength(2);
    });

    it('filters by instructorId when provided as parameter', async () => {
      const instructorId = 5;
      const fakeData: any = [
        {
          id: 1,
          year: 2024,
          semester: 1,
          active: true,
          subjectId: 1,
          subject: {
            id: 1,
            thaiName: 'วิชาA',
            engName: 'Subject A',
            code: 'SUB001',
          },
        },
      ];

      prisma.course.findMany.mockResolvedValue(fakeData);
      prisma.course.count.mockResolvedValue(1);

      const result = await service.findAll({}, instructorId);

      expect(prisma.course.findMany).toHaveBeenCalledWith({
        take: 16,
        skip: 0,
        orderBy: { id: 'asc' },
        where: {
          course_instructors: { some: { instructorId } },
        },
        include: { subject: true },
      });

      expect(result.data).toHaveLength(1);
    });

    it('handles empty results', async () => {
      prisma.course.findMany.mockResolvedValue([]);
      prisma.course.count.mockResolvedValue(0);

      const result = await service.findAll();

      expect(result.data).toEqual([]);
      expect(result.meta).toEqual({
        total: 0,
        page: 1,
        limit: 16,
        totalPages: 0,
      });
    });

    it('throws InternalServerErrorException on database error', async () => {
      prisma.course.findMany.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAllOptions', () => {
    it('returns distinct years from courses', async () => {
      const fakeYears = [{ year: 2022 }, { year: 2023 }, { year: 2024 }];

      // @ts-expect-error Suppress Prisma recursive conditional type expansion for mocked groupBy
      prisma.course.groupBy.mockResolvedValue(fakeYears);

      const result = await service.findAllOptions();

      // Simplified assertion to avoid triggering deep Prisma generic type expansion
      expect(prisma.course.groupBy).toHaveBeenCalledTimes(1);
      expect(result).toEqual([2022, 2023, 2024]);
    });

    it('throws InternalServerErrorException on database error', async () => {
      prisma.course.groupBy.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.findAllOptions()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('returns a course with nested data and student count', async () => {
      const fakeCourse: any = {
        id: 1,
        year: 2024,
        semester: 1,
        active: true,
        subjectId: 1,
        subject: {
          id: 1,
          thaiName: 'วิชาA',
          engName: 'Subject A',
          code: 'SUB001',
          clos: [
            {
              id: 1,
              name: 'CLO1',
              skill: { id: 1, engName: 'Skill1', thaiName: 'ทักษะ1' },
            },
          ],
        },
      };

      prisma.course.findUnique.mockResolvedValue(fakeCourse);
      prisma.student.count.mockResolvedValue(25);

      const result = await service.findOne(1);

      expect(prisma.course.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          subject: {
            include: {
              clos: {
                include: {
                  skill: {
                    select: { id: true, engName: true, thaiName: true },
                  },
                },
              },
            },
          },
        },
      });
      expect(prisma.student.count).toHaveBeenCalledWith({
        where: {
          skill_collections: {
            some: {
              courseId: 1,
            },
          },
        },
      });

      expect(result).toEqual({ ...fakeCourse, studentCount: 25 });
    });

    it('throws InternalServerErrorException when course not found', async () => {
      prisma.course.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('throws InternalServerErrorException on database error', async () => {
      prisma.course.findUnique.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.findOne(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('create', () => {
    it('creates multiple courses successfully', async () => {
      const createDtos = [
        {
          year: 2024,
          semester: 1,
          active: true,
          subjectId: 1,
        },
        {
          year: 2024,
          semester: 2,
          active: true,
          subjectId: 2,
        },
      ];

      const fakeSubject: any = { id: 1, thaiName: 'วิชาA', code: 'SUB001' };
      const createdCourses = createDtos.map((dto, i) => ({
        id: i + 1,
        ...dto,
        subject: fakeSubject,
        course_instructors: [],
      }));

      prisma.subject.findUnique.mockResolvedValue(fakeSubject);
      prisma.course.create.mockResolvedValueOnce(createdCourses[0]);
      prisma.course.create.mockResolvedValueOnce(createdCourses[1]);

      const result = await service.create(createDtos);

      expect(prisma.subject.findUnique).toHaveBeenCalledTimes(2);
      expect(prisma.course.create).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
    });

    it('creates course with instructor when instructorId provided', async () => {
      const createDtos = [
        {
          year: 2024,
          semester: 1,
          active: true,
          subjectId: 1,
        },
      ];
      const instructorId = 5;

      const fakeSubject: any = { id: 1, thaiName: 'วิชาA', code: 'SUB001' };
      const createdCourse = {
        id: 1,
        ...createDtos[0],
        instructorId,
        subject: fakeSubject,
        course_instructors: [],
      };

      prisma.subject.findUnique.mockResolvedValue(fakeSubject);
      prisma.course.create.mockResolvedValue(createdCourse);

      const result = await service.create(createDtos, instructorId);

      expect(prisma.course.create).toHaveBeenCalledWith({
        data: {
          year: 2024,
          semester: 1,
          active: true,
          subject: { connect: { id: 1 } },
          instructorId,
        },
        include: {
          subject: true,
          course_instructors: {
            include: {
              instructor: true,
            },
          },
        },
      });
      expect(result).toHaveLength(1);
    });

    it('throws BadRequestException when subject not found', async () => {
      const createDtos = [
        {
          year: 2024,
          semester: 1,
          active: true,
          subjectId: 999,
        },
      ];

      prisma.subject.findUnique.mockResolvedValue(null);

      await expect(service.create(createDtos)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException on creation failure', async () => {
      const createDtos = [
        {
          year: 2024,
          semester: 1,
          active: true,
          subjectId: 1,
        },
      ];

      const fakeSubject: any = { id: 1, thaiName: 'วิชาA', code: 'SUB001' };
      prisma.subject.findUnique.mockResolvedValue(fakeSubject);
      prisma.course.create.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDtos)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('updates a course successfully', async () => {
      const updateDto = { active: false };
      const updatedCourse: any = {
        id: 1,
        year: 2024,
        semester: 1,
        active: false,
        subjectId: 1,
        subject: { id: 1, thaiName: 'วิชาA' },
        course_instructors: [],
      };

      prisma.course.update.mockResolvedValue(updatedCourse);

      const result = await service.update(1, updateDto);

      expect(prisma.course.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
        include: {
          subject: true,
          course_instructors: true,
        },
      });
      expect(result).toEqual(updatedCourse);
    });

    it('throws NotFoundException when course to update does not exist', async () => {
      const updateDto = { active: false };
      const error: any = new Error('Record not found');
      error.code = 'P2025';

      prisma.course.update.mockRejectedValue(error);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws BadRequestException on other update failures', async () => {
      const updateDto = { active: false };
      prisma.course.update.mockRejectedValue(new Error('Database error'));

      await expect(service.update(1, updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('deletes a course successfully', async () => {
      prisma.course.delete.mockResolvedValue({
        id: 1,
        year: 2024,
        semester: 1,
        active: true,
        subjectId: 1,
      } as any);

      await service.remove(1);

      expect(prisma.course.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('throws NotFoundException when course to delete does not exist', async () => {
      const error: any = new Error('Record not found');
      error.code = 'P2025';

      prisma.course.delete.mockRejectedValue(error);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException on other deletion failures', async () => {
      prisma.course.delete.mockRejectedValue(new Error('Database error'));

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });
  });
});
