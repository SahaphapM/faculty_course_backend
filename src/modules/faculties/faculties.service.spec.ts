import { Test, TestingModule } from '@nestjs/testing';
import { FacultiesService } from './faculties.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { createPrismaMock } from 'src/test-utils/prisma.mock';
import {
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

describe('FacultiesService', () => {
  let service: FacultiesService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacultiesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<FacultiesService>(FacultiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll pagination', () => {
    it('returns paginated meta & data with default parameters', async () => {
      const fakeData = [
        {
          id: 1,
          thaiName: 'คณะวิศวกรรมศาสตร์',
          engName: 'Faculty of Engineering',
          thaiDescription: null,
          engDescription: null,
          abbrev: null,
          branch: [],
        },
        {
          id: 2,
          thaiName: 'คณะวิทยาศาสตร์',
          engName: 'Faculty of Science',
          thaiDescription: null,
          engDescription: null,
          abbrev: null,
          branch: [],
        },
      ];

      prisma.faculty.findMany.mockResolvedValue(fakeData);
      prisma.faculty.count.mockResolvedValue(15);

      const result = await service.findAll({});

      expect(prisma.faculty.findMany).toHaveBeenCalledWith({
        include: { branch: true },
        where: {},
        take: 10,
        skip: 0,
        orderBy: { id: 'asc' },
      });
      expect(prisma.faculty.count).toHaveBeenCalledWith({ where: {} });

      expect((result as any).data).toHaveLength(2);
      expect((result as any).meta).toEqual({
        total: 15,
        page: 1,
        limit: 10,
        totalPages: 2,
      });
    });

    it('returns paginated data with custom page and limit', async () => {
      const page = 3;
      const limit = 5;

      const fakeData = Array.from({ length: limit }).map((_, i) => ({
        id: i + 11, // Page 3 starts at item 11
        thaiName: `คณะ${i + 11}`,
        engName: `Faculty${i + 11}`,
        thaiDescription: null,
        engDescription: null,
        abbrev: null,
        branch: [],
      }));

      prisma.faculty.findMany.mockResolvedValue(fakeData);
      prisma.faculty.count.mockResolvedValue(25);

      const result = await service.findAll({ page, limit });

      expect(prisma.faculty.findMany).toHaveBeenCalledWith({
        include: { branch: true },
        where: {},
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { id: 'asc' },
      });

      expect((result as any).data).toHaveLength(limit);
      expect((result as any).meta).toEqual({
        total: 25,
        page,
        limit,
        totalPages: Math.ceil(25 / limit),
      });
    });

    it('filters by thaiName when provided', async () => {
      const thaiName = 'วิศวกรรม';
      const fakeData = [
        {
          id: 1,
          thaiName: 'คณะวิศวกรรมศาสตร์',
          engName: 'Faculty of Engineering',
          thaiDescription: null,
          engDescription: null,
          abbrev: null,
          branch: [],
        },
      ];

      prisma.faculty.findMany.mockResolvedValue(fakeData);
      prisma.faculty.count.mockResolvedValue(1);

      const result = await service.findAll({ thaiName });

      expect(prisma.faculty.findMany).toHaveBeenCalledWith({
        include: { branch: true },
        where: { thaiName: { contains: thaiName } },
        take: 10,
        skip: 0,
        orderBy: { id: 'asc' },
      });
      expect(prisma.faculty.count).toHaveBeenCalledWith({
        where: { thaiName: { contains: thaiName } },
      });

      expect((result as any).data).toHaveLength(1);
      expect((result as any).data[0].thaiName).toContain('วิศวกรรม');
    });

    it('filters by engName when provided', async () => {
      const engName = 'Engineering';
      const fakeData = [
        {
          id: 1,
          thaiName: 'คณะวิศวกรรมศาสตร์',
          engName: 'Faculty of Engineering',
          thaiDescription: null,
          engDescription: null,
          abbrev: null,
          branch: [],
        },
      ];

      prisma.faculty.findMany.mockResolvedValue(fakeData);
      prisma.faculty.count.mockResolvedValue(1);

      const result = await service.findAll({ engName });

      expect(prisma.faculty.findMany).toHaveBeenCalledWith({
        include: { branch: true },
        where: { engName: { contains: engName } },
        take: 10,
        skip: 0,
        orderBy: { id: 'asc' },
      });

      expect((result as any).data).toHaveLength(1);
      expect((result as any).data[0].engName).toContain('Engineering');
    });

    it('applies custom ordering', async () => {
      const fakeData = [
        {
          id: 2,
          thaiName: 'คณะB',
          engName: 'Faculty B',
          thaiDescription: null,
          engDescription: null,
          abbrev: null,
          branch: [],
        },
        {
          id: 1,
          thaiName: 'คณะA',
          engName: 'Faculty A',
          thaiDescription: null,
          engDescription: null,
          abbrev: null,
          branch: [],
        },
      ];

      prisma.faculty.findMany.mockResolvedValue(fakeData);
      prisma.faculty.count.mockResolvedValue(2);

      const result = await service.findAll({ orderBy: 'desc' });

      expect(prisma.faculty.findMany).toHaveBeenCalledWith({
        include: { branch: true },
        where: {},
        take: 10,
        skip: 0,
        orderBy: { id: 'desc' },
      });

      expect((result as any).data).toHaveLength(2);
    });

    it('handles empty results', async () => {
      prisma.faculty.findMany.mockResolvedValue([]);
      prisma.faculty.count.mockResolvedValue(0);

      const result = await service.findAll({});

      expect((result as any).data).toEqual([]);
      expect((result as any).meta).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });

    it('returns all faculties when no pagination params provided', async () => {
      const fakeData = [
        {
          id: 1,
          thaiName: 'คณะA',
          engName: 'Faculty A',
          thaiDescription: null,
          engDescription: null,
          abbrev: null,
          branch: [],
        },
        {
          id: 2,
          thaiName: 'คณะB',
          engName: 'Faculty B',
          thaiDescription: null,
          engDescription: null,
          abbrev: null,
          branch: [],
        },
      ];

      prisma.faculty.findMany.mockResolvedValue(fakeData);

      const result = await service.findAll();

      expect(prisma.faculty.findMany).toHaveBeenCalledWith({
        include: { branch: true },
      });
      expect(result).toEqual(fakeData);
    });

    it('throws InternalServerErrorException on database error', async () => {
      prisma.faculty.findMany.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.findAll({})).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findFilters', () => {
    it('returns faculties with nested branch and curriculum data', async () => {
      const fakeData = [
        {
          id: 1,
          thaiName: 'คณะวิศวกรรมศาสตร์',
          engName: 'Faculty of Engineering',
          thaiDescription: null,
          engDescription: null,
          abbrev: null,
          branch: [
            {
              id: 1,
              thaiName: 'สาขาวิศวกรรมคอมพิวเตอร์',
              engName: 'Computer Engineering',
              curriculum: [
                {
                  id: 1,
                  thaiName: 'หลักสูตรวิศวกรรมคอมพิวเตอร์',
                  engName: 'Computer Engineering Curriculum',
                },
              ],
            },
          ],
        },
      ];

      prisma.faculty.findMany.mockResolvedValue(fakeData);

      const result = await service.findFilters();

      expect(prisma.faculty.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          thaiName: true,
          engName: true,
          branch: {
            select: {
              id: true,
              thaiName: true,
              engName: true,
              curriculum: {
                select: {
                  id: true,
                  thaiName: true,
                  engName: true,
                },
              },
            },
          },
        },
      });
      expect(result).toEqual(fakeData);
    });

    it('throws InternalServerErrorException on database error', async () => {
      prisma.faculty.findMany.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.findFilters()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('returns a faculty when found', async () => {
      const fakeFaculty = {
        id: 1,
        thaiName: 'คณะวิศวกรรมศาสตร์',
        engName: 'Faculty of Engineering',
        thaiDescription: null,
        engDescription: null,
        abbrev: null,
        branch: [],
      };

      prisma.faculty.findUnique.mockResolvedValue(fakeFaculty);

      const result = await service.findOne(1);

      expect(prisma.faculty.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { branch: true },
      });
      expect(result).toEqual(fakeFaculty);
    });

    it('throws InternalServerErrorException when faculty not found', async () => {
      prisma.faculty.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('throws InternalServerErrorException on database error', async () => {
      prisma.faculty.findUnique.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.findOne(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('create', () => {
    it('creates a new faculty successfully', async () => {
      const createDto = {
        thaiName: 'คณะใหม่',
        engName: 'New Faculty',
      };

      const createdFaculty = {
        id: 1,
        ...createDto,
        thaiDescription: null,
        engDescription: null,
        abbrev: null,
      };
      prisma.faculty.create.mockResolvedValue(createdFaculty);

      const result = await service.create(createDto);

      expect(prisma.faculty.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(result).toEqual(createdFaculty);
    });

    it('throws BadRequestException on creation failure', async () => {
      const createDto = {
        thaiName: 'คณะใหม่',
        engName: 'New Faculty',
      };

      prisma.faculty.create.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('updates a faculty successfully', async () => {
      const updateDto = { thaiName: 'คณะที่อัพเดทแล้ว' };
      const updatedFaculty = {
        id: 1,
        thaiName: 'คณะที่อัพเดทแล้ว',
        engName: null,
        thaiDescription: null,
        engDescription: null,
        abbrev: null,
      };

      prisma.faculty.update.mockResolvedValue(updatedFaculty);

      const result = await service.update(1, updateDto);

      expect(prisma.faculty.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
      expect(result).toEqual(updatedFaculty);
    });

    it('throws NotFoundException when faculty to update does not exist', async () => {
      const updateDto = { thaiName: 'Updated Faculty' };
      const error = new Error('Record not found');
      (error as any).code = 'P2025';

      prisma.faculty.update.mockRejectedValue(error);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws BadRequestException on other update failures', async () => {
      const updateDto = { thaiName: 'Updated Faculty' };
      prisma.faculty.update.mockRejectedValue(new Error('Database error'));

      await expect(service.update(1, updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('deletes a faculty successfully', async () => {
      prisma.faculty.delete.mockResolvedValue({
        id: 1,
        thaiName: 'Deleted Faculty',
        engName: null,
        thaiDescription: null,
        engDescription: null,
        abbrev: null,
      });

      await service.remove(1);

      expect(prisma.faculty.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('throws NotFoundException when faculty to delete does not exist', async () => {
      const error = new Error('Record not found');
      (error as any).code = 'P2025';

      prisma.faculty.delete.mockRejectedValue(error);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException on other deletion failures', async () => {
      prisma.faculty.delete.mockRejectedValue(new Error('Database error'));

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });
  });
});
