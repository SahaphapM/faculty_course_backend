import { Test, TestingModule } from '@nestjs/testing';
import { LessonsService } from './lessons.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('LessonsService', () => {
  let service: LessonsService;
  let prisma: {
    lesson: {
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      lesson: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [LessonsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<LessonsService>(LessonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll pagination', () => {
    it('returns paginated result with meta when page & limit provided', async () => {
      const page = 2;
      const limit = 4;

      const fakeData = Array.from({ length: limit }).map((_, i) => ({
        id: i + 1,
        thaiName: `บทเรียน${i + 1}`,
        engName: `Lesson${i + 1}`,
      }));

      prisma.lesson.findMany.mockResolvedValue(fakeData);
      prisma.lesson.count.mockResolvedValue(17);

      const result = await service.findAll({
        page,
        limit,
        orderBy: 'asc',
        thaiName: 'บท',
      } as any);

      expect(prisma.lesson.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { id: 'asc' },
          where: expect.objectContaining({
            thaiName: { contains: 'บท' },
          }),
        }),
      );

      // Now that findAll always returns PaginatedResult
      expect(result.data).toHaveLength(limit);
      expect(result.meta).toEqual({
        total: 17,
        page,
        limit,
        totalPages: Math.ceil(17 / limit),
      });
    });

    it('falls back to defaults when pagination params omitted', async () => {
      prisma.lesson.findMany.mockResolvedValue([]);
      prisma.lesson.count.mockResolvedValue(0);

      const result = await service.findAll({} as any);

      expect(prisma.lesson.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10, // service default
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
  });
});
