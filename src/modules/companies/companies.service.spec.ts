import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from './companies.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let prisma: {
    company: {
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    company_job_position: {
      findMany: jest.Mock;
      deleteMany: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      company: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      company_job_position: {
        findMany: jest.fn(),
        deleteMany: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll pagination', () => {
    it('returns proper paginated meta and data (custom page/limit)', async () => {
      const page = 2;
      const limit = 5;

      const fakeData = Array.from({ length: limit }).map((_, i) => ({
        id: i + 1,
        name: `Acme${i + 1}`,
        tel: '123',
        email: 'x@y.com',
      }));

      prisma.company.findMany.mockResolvedValue(fakeData);
      prisma.company.count.mockResolvedValue(25);

      const result = await service.findAll({
        page,
        limit,
        search: 'Ac',
        sort: '-id',
      });

      // Assert prisma call
      expect(prisma.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { id: 'desc' },
          where: {
            OR: expect.any(Array),
          },
        }),
      );

      // Returned data
      expect(result.data).toHaveLength(limit);
      expect(result.meta).toEqual({
        total: 25,
        page,
        limit,
        totalPages: Math.ceil(25 / limit),
      });
    });

    it('falls back to defaults when page & limit not provided', async () => {
      prisma.company.findMany.mockResolvedValue([]);
      prisma.company.count.mockResolvedValue(0);

      const result = await service.findAll({});

      expect(prisma.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
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
