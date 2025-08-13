import { Test, TestingModule } from '@nestjs/testing';
import { BranchesService } from './branches.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('BranchesService', () => {
  let service: BranchesService;
  let prisma: {
    branch: {
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    faculty: {
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      branch: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      faculty: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<BranchesService>(BranchesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll pagination', () => {
    it('returns paginated meta with filters applied', async () => {
      const page = 2;
      const limit = 3;

      const fakeData = Array.from({ length: limit }).map((_, i) => ({
        id: i + 1,
        thaiName: `สาขา${i + 1}`,
        engName: `Branch${i + 1}`,
        facultyId: 1,
      }));

      prisma.branch.findMany.mockResolvedValue(fakeData);
      prisma.branch.count.mockResolvedValue(11); // total matching
      const result = await service.findAll({
        page,
        limit,
        thaiName: 'สา',
        sort: 'id',
        orderBy: 'asc',
      } as any);

      expect(prisma.branch.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { id: 'asc' },
          where: expect.objectContaining({
            thaiName: expect.any(Object),
          }),
        }),
      );

      // findAll now always returns PaginatedResult
      expect(result.data).toHaveLength(limit);
      expect(result.meta).toEqual({
        total: 11,
        page,
        limit,
        totalPages: Math.ceil(11 / limit),
      });
    });

    it('falls back to defaults when pagination params omitted', async () => {
      prisma.branch.findMany.mockResolvedValue([]);
      prisma.branch.count.mockResolvedValue(0);

      const result = await service.findAll({} as any);

      expect(prisma.branch.findMany).toHaveBeenCalledWith(
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
