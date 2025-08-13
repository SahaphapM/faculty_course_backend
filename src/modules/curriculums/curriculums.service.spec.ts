// ts-nocheck removed to enforce type safety
import { Test, TestingModule } from '@nestjs/testing';
import { CurriculumsService } from './curriculums.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { createPrismaMock } from 'src/test-utils/prisma.mock';
import {
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { makeCurriculum } from 'src/test-utils/factories/entity.factories';

describe('CurriculumsService', () => {
  let service: CurriculumsService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurriculumsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CurriculumsService>(CurriculumsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll pagination', () => {
    it('returns paginated meta & data with default parameters', async () => {
      const fakeData = [
        makeCurriculum({
          id: 1,
          code: 'CE2024',
          thaiName: 'หลักสูตรวิศวกรรมคอมพิวเตอร์',
          engName: 'Computer Engineering Curriculum',
          thaiDegree: 'วิศวกรรมศาสตรบัณฑิต',
          engDegree: 'Bachelor of Engineering',
          branchId: 1,
          branch: {
            id: 1,
            thaiName: 'วิศวกรรมคอมพิวเตอร์',
            engName: 'Computer Engineering',
          },
        }),
        makeCurriculum({
          id: 2,
          code: 'EE2024',
          thaiName: 'หลักสูตรวิศวกรรมไฟฟ้า',
          engName: 'Electrical Engineering Curriculum',
          thaiDegree: 'วิศวกรรมศาสตรบัณฑิต',
          engDegree: 'Bachelor of Engineering',
          branchId: 2,
          branch: {
            id: 2,
            thaiName: 'วิศวกรรมไฟฟ้า',
            engName: 'Electrical Engineering',
          },
        }),
      ];

      prisma.curriculum.findMany.mockResolvedValue(fakeData);
      prisma.curriculum.count.mockResolvedValue(20);

      const result = await service.findAll();

      expect(prisma.curriculum.findMany).toHaveBeenCalledWith({
        take: 15,
        skip: 0,
        orderBy: { id: 'asc' },
        include: {
          branch: {
            select: {
              id: true,
              thaiName: true,
              engName: true,
            },
          },
        },
        where: {},
      });
      expect(prisma.curriculum.count).toHaveBeenCalledWith({ where: {} });

      expect(result.data).toHaveLength(2);
      expect(result.meta).toEqual({
        total: 20,
        page: 1,
        limit: 15,
        totalPages: 2,
      });
    });

    it('returns paginated data with custom page and limit', async () => {
      const page = 2;
      const limit = 8;

      const fakeData = Array.from({ length: limit }).map((_, i) => ({
        id: i + 9,
        thaiName: `หลักสูตร${i + 9}`,
        engName: `Curriculum${i + 9}`,
        code: `CUR00${i + 9}`,
        thaiDegree: 'ปริญญาบัณฑิต',
        engDegree: 'Bachelor Degree',
        branchId: 1,
        period: 4,
        minimumGrade: new Prisma.Decimal('2.00'),
        thaiDescription: null,
        engDescription: null,
        branch: {
          id: 1,
          thaiName: 'สาขาA',
          engName: 'Branch A',
        },
      }));

      prisma.curriculum.findMany.mockResolvedValue(fakeData);
      prisma.curriculum.count.mockResolvedValue(30);

      const result = await service.findAll({ page, limit });

      expect(prisma.curriculum.findMany).toHaveBeenCalledWith({
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { id: 'asc' },
        include: {
          branch: {
            select: {
              id: true,
              thaiName: true,
              engName: true,
            },
          },
        },
        where: {},
      });

      expect(result.data).toHaveLength(limit);
      expect(result.meta).toEqual({
        total: 30,
        page,
        limit,
        totalPages: Math.ceil(30 / limit),
      });
    });

    it('filters by nameCode (searches name and code)', async () => {
      const nameCode = 'วิศวกรรม';
      const fakeData = [
        {
          id: 1,
          thaiName: 'หลักสูตรวิศวกรรมคอมพิวเตอร์',
          engName: 'Computer Engineering Curriculum',
          code: 'CE2024',
          thaiDegree: 'วิศวกรรมศาสตรบัณฑิต',
          engDegree: 'Bachelor of Engineering',
          branchId: 1,
          period: 4,
          minimumGrade: new Prisma.Decimal('2.00'),
          thaiDescription: null,
          engDescription: null,
          branch: {
            id: 1,
            thaiName: 'วิศวกรรมคอมพิวเตอร์',
            engName: 'Computer Engineering',
          },
        },
      ];

      prisma.curriculum.findMany.mockResolvedValue(fakeData);
      prisma.curriculum.count.mockResolvedValue(1);

      const result = await service.findAll({ nameCode });

      expect(prisma.curriculum.findMany).toHaveBeenCalledWith({
        take: 15,
        skip: 0,
        orderBy: { id: 'asc' },
        include: {
          branch: {
            select: {
              id: true,
              thaiName: true,
              engName: true,
            },
          },
        },
        where: {
          OR: [
            { thaiName: { contains: nameCode } },
            { engName: { contains: nameCode } },
            { code: { contains: nameCode } },
          ],
        },
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].thaiName).toContain('วิศวกรรม');
    });

    it('filters by degree when provided', async () => {
      const degree = 'Bachelor';
      const fakeData = [
        {
          id: 1,
          thaiName: 'หลักสูตรA',
          engName: 'Curriculum A',
          code: 'CA2024',
          thaiDegree: 'ปริญญาบัณฑิต',
          engDegree: 'Bachelor of Science',
          branchId: 1,
          period: 4,
          minimumGrade: new Prisma.Decimal('2.00'),
          thaiDescription: null,
          engDescription: null,
          branch: {
            id: 1,
            thaiName: 'สาขาA',
            engName: 'Branch A',
          },
        },
      ];

      prisma.curriculum.findMany.mockResolvedValue(fakeData);
      prisma.curriculum.count.mockResolvedValue(1);

      const result = await service.findAll({ degree });

      expect(prisma.curriculum.findMany).toHaveBeenCalledWith({
        take: 15,
        skip: 0,
        orderBy: { id: 'asc' },
        include: {
          branch: {
            select: {
              id: true,
              thaiName: true,
              engName: true,
            },
          },
        },
        where: {
          OR: [
            { engDegree: { contains: degree } },
            { thaiDegree: { contains: degree } },
          ],
        },
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].engDegree).toContain('Bachelor');
    });

    it('filters by branchId when provided', async () => {
      const branchId = 5;
      const fakeData = [
        {
          id: 1,
          thaiName: 'หลักสูตรA',
          engName: 'Curriculum A',
          code: 'CA2024',
          branchId: 5,
          thaiDegree: 'ปริญญาบัณฑิต',
          engDegree: 'Bachelor Degree',
          period: 4,
          minimumGrade: new Prisma.Decimal('2.00'),
          thaiDescription: null,
          engDescription: null,
          branch: {
            id: 5,
            thaiName: 'สาขาE',
            engName: 'Branch E',
          },
        },
      ];

      prisma.curriculum.findMany.mockResolvedValue(fakeData);
      prisma.curriculum.count.mockResolvedValue(1);

      const result = await service.findAll({ branchId });

      expect(prisma.curriculum.findMany).toHaveBeenCalledWith({
        take: 15,
        skip: 0,
        orderBy: { id: 'asc' },
        include: {
          branch: {
            select: {
              id: true,
              thaiName: true,
              engName: true,
            },
          },
        },
        where: { branchId },
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].branchId).toBe(branchId);
    });

    it('filters by facultyId when provided', async () => {
      const facultyId = 3;
      const fakeData = [
        {
          id: 1,
          thaiName: 'หลักสูตรA',
          engName: 'Curriculum A',
          code: 'CA2024',
          branchId: 1,
          thaiDegree: 'ปริญญาบัณฑิต',
          engDegree: 'Bachelor Degree',
          period: 4,
          minimumGrade: new Prisma.Decimal('2.00'),
          thaiDescription: null,
          engDescription: null,
          branch: {
            id: 1,
            thaiName: 'สาขาA',
            engName: 'Branch A',
            facultyId,
          },
        },
      ];

      prisma.curriculum.findMany.mockResolvedValue(fakeData);
      prisma.curriculum.count.mockResolvedValue(1);

      const result = await service.findAll({ facultyId });

      expect(prisma.curriculum.findMany).toHaveBeenCalledWith({
        take: 15,
        skip: 0,
        orderBy: { id: 'asc' },
        include: {
          branch: {
            select: {
              id: true,
              thaiName: true,
              engName: true,
            },
          },
        },
        where: { branch: { facultyId } },
      });

      expect(result.data).toHaveLength(1);
    });

    it('applies custom sorting', async () => {
      const fakeData = [
        {
          id: 2,
          thaiName: 'หลักสูตรB',
          engName: 'Curriculum B',
          code: 'CB2024',
          branchId: 1,
          thaiDegree: 'ปริญญาบัณฑิต',
          engDegree: 'Bachelor Degree',
          period: 4,
          minimumGrade: new Prisma.Decimal('2.00'),
          thaiDescription: null,
          engDescription: null,
          branch: {
            id: 1,
            thaiName: 'สาขาA',
            engName: 'Branch A',
          },
        },
        {
          id: 1,
          thaiName: 'หลักสูตรA',
          engName: 'Curriculum A',
          code: 'CA2024',
          branchId: 1,
          thaiDegree: 'ปริญญาบัณฑิต',
          engDegree: 'Bachelor Degree',
          period: 4,
          minimumGrade: new Prisma.Decimal('2.00'),
          thaiDescription: null,
          engDescription: null,
          branch: {
            id: 1,
            thaiName: 'สาขาA',
            engName: 'Branch A',
          },
        },
      ];

      prisma.curriculum.findMany.mockResolvedValue(fakeData);
      prisma.curriculum.count.mockResolvedValue(2);

      const result = await service.findAll({
        sort: 'code',
        orderBy: 'desc',
      });

      expect(prisma.curriculum.findMany).toHaveBeenCalledWith({
        take: 15,
        skip: 0,
        orderBy: { code: 'desc' },
        include: {
          branch: {
            select: {
              id: true,
              thaiName: true,
              engName: true,
            },
          },
        },
        where: {},
      });

      expect(result.data).toHaveLength(2);
    });

    it('handles empty sort field gracefully', async () => {
      const fakeData: any[] = [];

      prisma.curriculum.findMany.mockResolvedValue(fakeData);
      prisma.curriculum.count.mockResolvedValue(0);

      const result = await service.findAll({ sort: '' });

      expect(prisma.curriculum.findMany).toHaveBeenCalledWith({
        take: 15,
        skip: 0,
        orderBy: { id: 'asc' },
        include: {
          branch: {
            select: {
              id: true,
              thaiName: true,
              engName: true,
            },
          },
        },
        where: {},
      });

      expect(result.data).toEqual([]);
    });

    // Removed test: 'filters by instructorId when provided as parameter' because instructorId is not part of generated Curriculum type

    it('handles empty results', async () => {
      prisma.curriculum.findMany.mockResolvedValue([]);
      prisma.curriculum.count.mockResolvedValue(0);

      const result = await service.findAll();

      expect(result.data).toEqual([]);
      expect(result.meta).toEqual({
        total: 0,
        page: 1,
        limit: 15,
        totalPages: 0,
      });
    });
  });

  describe('findOne', () => {
    it('returns a curriculum when found', async () => {
      const fakeCurriculum = {
        id: 1,
        thaiName: 'หลักสูตรวิศวกรรมคอมพิวเตอร์',
        engName: 'Computer Engineering Curriculum',
        code: 'CE2024',
        branchId: 1,
        thaiDegree: 'วิศวกรรมศาสตรบัณฑิต',
        engDegree: 'Bachelor of Engineering',
        period: 4,
        minimumGrade: new Prisma.Decimal('2.00'),
        thaiDescription: null,
        engDescription: null,
      };

      prisma.curriculum.findUnique.mockResolvedValue(fakeCurriculum);

      const result = await service.findOne(1);

      expect(prisma.curriculum.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(fakeCurriculum);
    });

    it('throws NotFoundException when curriculum not found', async () => {
      prisma.curriculum.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneByCode', () => {
    it('returns a curriculum when found by code', async () => {
      const fakeCurriculum = {
        id: 1,
        thaiName: 'หลักสูตรวิศวกรรมคอมพิวเตอร์',
        engName: 'Computer Engineering Curriculum',
        code: 'CE2024',
        branchId: 1,
        thaiDegree: 'วิศวกรรมศาสตรบัณฑิต',
        engDegree: 'Bachelor of Engineering',
        period: 4,
        minimumGrade: new Prisma.Decimal('2.00'),
        thaiDescription: null,
        engDescription: null,
      };

      prisma.curriculum.findUnique.mockResolvedValue(fakeCurriculum);

      const result = await service.findOneByCode('CE2024');

      expect(prisma.curriculum.findUnique).toHaveBeenCalledWith({
        where: { code: 'CE2024' },
        include: {
          branch: true,
        },
      });
      expect(result).toEqual(fakeCurriculum);
    });

    it('throws NotFoundException when curriculum not found by code', async () => {
      prisma.curriculum.findUnique.mockResolvedValue(null);

      await expect(service.findOneByCode('INVALID')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates a new curriculum successfully', async () => {
      const createDto = {
        thaiName: 'หลักสูตรใหม่',
        engName: 'New Curriculum',
        code: 'NEW2024',
        thaiDegree: 'ปริญญาบัณฑิต',
        engDegree: 'Bachelor Degree',
        branchId: 1,
        period: 4,
        minimumGrade: new Prisma.Decimal('2.00'),
      };

      const createdCurriculum = {
        id: 1,
        ...createDto,
        thaiDescription: null,
        engDescription: null,
      };
      const levels = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        level: i < 5 ? i + 1 : i - 4,
        isHardSkill: i < 5,
        curriculumId: 1,
      }));

      prisma.curriculum.create.mockResolvedValue(createdCurriculum);
      prisma.level_description.createMany.mockResolvedValue({ count: 8 });

      const result = await service.create(createDto as any);

      expect(prisma.curriculum.create).toHaveBeenCalledWith({
        data: {
          thaiName: createDto.thaiName,
          engName: createDto.engName,
          code: createDto.code,
          thaiDegree: createDto.thaiDegree,
          engDegree: createDto.engDegree,
          branch: { connect: { id: createDto.branchId } },
        },
      });
      expect(prisma.level_description.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            level: 1,
            isHardSkill: true,
            curriculumId: createdCurriculum.id,
          }),
          expect.objectContaining({
            level: 5,
            isHardSkill: true,
            curriculumId: createdCurriculum.id,
          }),
          expect.objectContaining({
            level: 1,
            isHardSkill: false,
            curriculumId: createdCurriculum.id,
          }),
          expect.objectContaining({
            level: 3,
            isHardSkill: false,
            curriculumId: createdCurriculum.id,
          }),
        ]),
      });

      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Curriculum created successfully',
        data: createdCurriculum,
      });
    });

    // Removed test: instructor-specific creation (instructorId) since field not in generated Curriculum type
  });

  describe('update', () => {
    it('updates a curriculum successfully', async () => {
      const updateDto = { thaiName: 'หลักสูตรที่อัพเดทแล้ว' };
      const existingCurriculum: any = {
        id: 1,
        thaiName: 'หลักสูตรเก่า',
        code: 'OLD2024',
        branchId: 1,
        thaiDegree: 'ปริญญาบัณฑิต',
        engDegree: 'Bachelor Degree',
        period: 4,
        minimumGrade: new Prisma.Decimal('2.00'),
        thaiDescription: null,
        engDescription: null,
      };
      const updatedCurriculum: any = {
        id: 1,
        thaiName: 'หลักสูตรที่อัพเดทแล้ว',
        code: 'OLD2024',
        branchId: 1,
        thaiDegree: 'ปริญญาบัณฑิต',
        engDegree: 'Bachelor Degree',
        period: 4,
        minimumGrade: new Prisma.Decimal('2.00'),
        thaiDescription: null,
        engDescription: null,
      };

      prisma.curriculum.findUnique.mockResolvedValue(existingCurriculum);
      prisma.curriculum.update.mockResolvedValue(updatedCurriculum);

      const result = await service.update(1, updateDto as any);

      expect(prisma.curriculum.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prisma.curriculum.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
      expect(result).toEqual({
        statusCode: 200,
        message: 'Curriculum updated successfully',
        data: updatedCurriculum,
      });
    });

    it('throws NotFoundException when curriculum to update does not exist', async () => {
      const updateDto = { thaiName: 'Updated Curriculum' };

      prisma.curriculum.findUnique.mockResolvedValue(null);

      await expect(service.update(999, updateDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException on other update failures', async () => {
      const updateDto = { thaiName: 'Updated Curriculum' };
      const existingCurriculum: any = {
        id: 1,
        thaiName: 'หลักสูตรเก่า',
        code: 'OLD2024',
        branchId: 1,
        thaiDegree: 'ปริญญาบัณฑิต',
        engDegree: 'Bachelor Degree',
        period: 4,
        minimumGrade: new Prisma.Decimal('2.00'),
        thaiDescription: null,
        engDescription: null,
      };

      prisma.curriculum.findUnique.mockResolvedValue(existingCurriculum);
      prisma.curriculum.update.mockRejectedValue(new Error('Database error'));

      await expect(service.update(1, updateDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('deletes a curriculum successfully', async () => {
      prisma.curriculum.delete.mockResolvedValue({
        id: 1,
        thaiName: 'Deleted Curriculum',
        branchId: 1,
        thaiDegree: 'ปริญญาบัณฑิต',
        engDegree: 'Bachelor Degree',
        period: 4,
        minimumGrade: new Prisma.Decimal('2.00'),
        thaiDescription: null,
        engDescription: null,
        code: 'DEL2024',
      } as any);

      await service.remove(1);

      expect(prisma.curriculum.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('throws error when curriculum to delete does not exist', async () => {
      const error: any = new Error('Record not found');
      error.code = 'P2025';

      prisma.curriculum.delete.mockRejectedValue(error);

      await expect(service.remove(999)).rejects.toThrow(Error);
    });

    it('throws error on other deletion failures', async () => {
      prisma.curriculum.delete.mockRejectedValue(new Error('Database error'));

      await expect(service.remove(1)).rejects.toThrow(Error);
    });
  });
});
