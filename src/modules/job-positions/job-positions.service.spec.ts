import { Test, TestingModule } from '@nestjs/testing';
import { JobPositionsService } from './job-positions.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('JobPositionsService', () => {
  let service: JobPositionsService;
  let prisma: {
    job_position: {
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
      job_position: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobPositionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<JobPositionsService>(JobPositionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll pagination', () => {
    it('returns paginated result with meta (custom page/limit & sort)', async () => {
      const page = 3;
      const limit = 5;

      const fakeData = Array.from({ length: limit }).map((_, i) => ({
        id: i + 1,
        name: `Position ${i + 1}`,
      }));

      prisma.job_position.findMany.mockResolvedValue(fakeData);
      prisma.job_position.count.mockResolvedValue(42);

      const result = await service.findAll({
        page,
        limit,
        search: 'Pos',
        sort: '-id',
      });

      expect(prisma.job_position.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { id: 'desc' },
          where: {
            name: {
              contains: 'Pos',
            },
          },
        }),
      );

      expect(result.data).toHaveLength(limit);
      expect(result.meta).toEqual({
        total: 42,
        page,
        limit,
        totalPages: Math.ceil(42 / limit),
      });
    });

    it('applies defaults when page & limit omitted', async () => {
      prisma.job_position.findMany.mockResolvedValue([]);
      prisma.job_position.count.mockResolvedValue(0);

      const result = await service.findAll({});

      expect(prisma.job_position.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 5, // service default for limit = 5
        }),
      );

      expect(result.meta).toEqual({
        total: 0,
        page: 1,
        limit: 5,
        totalPages: 0,
      });
      expect(result.data).toEqual([]);
    });
  });
});
