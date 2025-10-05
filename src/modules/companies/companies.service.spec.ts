import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from './companies.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

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
    internship: {
      count: jest.Mock;
      findMany: jest.Mock;
    };
    student_internship: {
      count: jest.Mock;
      findMany: jest.Mock;
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
      internship: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      student_internship: {
        count: jest.fn(),
        findMany: jest.fn(),
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
          orderBy: expect.any(Object),
          where: expect.objectContaining({ OR: expect.any(Array) }),
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
          take: 15,
        }),
      );

      expect(result.meta).toEqual({
        total: 0,
        page: 1,
        limit: 15,
        totalPages: 0,
      });
      expect(result.data).toEqual([]);
    });
  });

  describe('remove', () => {
    const companyId = 1;

    beforeEach(() => {
      prisma.company.findUnique.mockResolvedValue({ id: companyId, name: 'Acme Corp' });
      prisma.internship.count.mockResolvedValue(0);
      prisma.internship.findMany.mockResolvedValue([]);
      prisma.student_internship.count.mockResolvedValue(0);
      prisma.student_internship.findMany.mockResolvedValue([]);
      prisma.company.delete.mockResolvedValue({ id: companyId });
    });

    it('removes a company when there are no blockers', async () => {
      const result = await service.remove(companyId);

      expect(prisma.company.delete).toHaveBeenCalledWith({ where: { id: companyId } });
      expect(result).toEqual({ id: companyId });
    });

    it('throws ConflictException when internships exist', async () => {
      prisma.internship.count.mockResolvedValue(2);
      prisma.internship.findMany.mockResolvedValue([
        { id: 5, year: 2024, curriculum: { code: 'CUR-1', thaiName: 'หลักสูตร', engName: null } },
      ]);
      prisma.student_internship.count.mockResolvedValue(0);

      await expect(service.remove(companyId)).rejects.toBeInstanceOf(ConflictException);

      expect(prisma.internship.findMany).toHaveBeenCalled();
      expect(prisma.company.delete).not.toHaveBeenCalled();
    });

    it('throws ConflictException when student internships exist', async () => {
      prisma.internship.count.mockResolvedValue(0);
      prisma.student_internship.count.mockResolvedValue(3);
      prisma.student_internship.findMany.mockResolvedValue([
        {
          id: 10,
          student: { id: 2, code: '64001', thaiName: 'สมชาย', engName: null },
          internship: { id: 7, year: 2024 },
        },
      ]);

      await expect(service.remove(companyId)).rejects.toBeInstanceOf(ConflictException);

      expect(prisma.student_internship.findMany).toHaveBeenCalled();
      expect(prisma.company.delete).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when company does not exist', async () => {
      prisma.company.findUnique.mockResolvedValue(null);

      await expect(service.remove(companyId)).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.company.delete).not.toHaveBeenCalled();
    });
  });
});
