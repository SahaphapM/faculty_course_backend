import { Test, TestingModule } from '@nestjs/testing';
import { PloService } from './plos.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('PlosService', () => {
  let service: PloService;
  let prisma: {
    plo: {
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
      plo: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PloService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<PloService>(PloService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll (pagination wrapper)', () => {
    it('returns paginated meta & data with curriculumCode filter', async () => {
      const fakeData = [
        { id: 1, name: 'PLO1' },
        { id: 2, name: 'PLO2' },
      ];
      prisma.plo.findMany.mockResolvedValue(fakeData);
      prisma.plo.count.mockResolvedValue(12);

      const result = await service.findAll({ curriculumCode: 'C123' } as any);

      expect(prisma.plo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { curriculum: { code: 'C123' } },
        }),
      );
      expect(prisma.plo.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { curriculum: { code: 'C123' } },
        }),
      );

      expect(result.data).toHaveLength(2);
      // Service currently fixes page to 1 and limit to data.length
      expect(result.meta).toEqual({
        total: 12,
        page: 1,
        limit: fakeData.length,
        totalPages: Math.ceil(12 / fakeData.length),
      });
    });

    it('returns empty pagination when no records', async () => {
      prisma.plo.findMany.mockResolvedValue([]);
      prisma.plo.count.mockResolvedValue(0);

      const result = await service.findAll();

      expect(prisma.plo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
      expect(result.data).toEqual([]);
      expect(result.meta).toEqual({
        total: 0,
        page: 1,
        limit: 0,
        totalPages: 0,
      });
    });
  });
});
