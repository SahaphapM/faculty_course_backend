import { Test, TestingModule } from '@nestjs/testing';
import { SubjectService } from './subjects.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('SubjectService (pagination focus)', () => {
  let service: SubjectService;
  let prisma: {
    subject: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    lesson: {
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      subject: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      lesson: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectService,
        {
          provide: PrismaService,
            // only the subset of prisma calls used by SubjectService
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<SubjectService>(SubjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll pagination', () => {
    it('returns paginated meta with custom page & limit & sort', async () => {
      const page = 2;
      const limit = 4;

      const fakeData = Array.from({ length: limit }).map((_, i) => ({
        id: i + 1,
        thaiName: `วิชา${i + 1}`,
        engName: `Subject${i + 1}`,
        code: `SUBJ${i + 1}`,
      }));

      prisma.subject.findMany.mockResolvedValue(fakeData);
      prisma.subject.count.mockResolvedValue(17);

      const result = await service.findAll({
        page,
        limit,
        sort: 'code',
        orderBy: 'desc',
        nameCode: 'SUBJ',
        type: 'CORE',
      } as any);

      // Assert prisma call contains pagination & filter
      expect(prisma.subject.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { code: 'desc' },
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ code: { contains: 'SUBJ' } }),
            ]),
            type: 'CORE',
          }),
        }),
      );

      // Data + meta assertions
      expect(result.data).toHaveLength(limit);
      expect(result.meta).toEqual({
        total: 17,
        page,
        limit,
        totalPages: Math.ceil(17 / limit),
      });
    });

    it('falls back to defaults when page & limit omitted', async () => {
      prisma.subject.findMany.mockResolvedValue([]);
      prisma.subject.count.mockResolvedValue(0);

      const result = await service.findAll({} as any);

      expect(prisma.subject.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10, // defaultLimit in service
        }),
      );

      expect(result.meta).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
      expect(result.data).toEqual([]);
    });

    it('applies branch / faculty / curriculum cascading filters correctly', async () => {
      prisma.subject.findMany.mockResolvedValue([]);
      prisma.subject.count.mockResolvedValue(0);

      await service.findAll({
        branchId: 5,
        facultyId: 9,
        curriculumId: 11,
      } as any);

      // Because of conditional spreading, we expect composite where with nested structures
      const callArgs = prisma.subject.findMany.mock.calls[0][0];
      expect(callArgs.where).toEqual(
        expect.objectContaining({
          curriculums: expect.objectContaining({
            some: expect.objectContaining({
              curriculum: expect.objectContaining({
                branchId: 5,
              }),
            }),
          }),
          // curriculumId applied directly
          curriculumId: 11,
        }),
      );
    });
  });

  describe('create', () => {
    it('creates subject and a copy lesson', async () => {
      const dto: any = {
        thaiName: 'ชื่อไทย',
        engName: 'English Name',
        code: 'SUBJ1',
        curriculumId: 3,
        type: 'CORE',
      };

      prisma.subject.create.mockResolvedValue({ id: 99, ...dto });
      prisma.lesson.create.mockResolvedValue({
        id: 500,
        thaiName: dto.thaiName,
        engName: dto.engName,
        subjectId: 99,
      });

      const result = await service.create(dto);

      expect(prisma.subject.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            code: 'SUBJ1',
            curriculumId: dto.curriculumId,
          }),
        }),
      );
      expect(prisma.lesson.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subjectId: 99,
            thaiName: dto.thaiName,
            engName: dto.engName,
          }),
        }),
      );
      expect(result.id).toBe(99);
    });
  });

  describe('remove', () => {
    it('deletes subject', async () => {
      prisma.subject.delete.mockResolvedValue({ id: 10 });
      const res = await service.remove(10);
      expect(prisma.subject.delete).toHaveBeenCalledWith({
        where: { id: 10 },
      });
      expect(res.id).toBe(10);
    });
  });
});
