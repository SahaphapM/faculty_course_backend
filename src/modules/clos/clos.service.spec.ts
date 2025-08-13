import { Test, TestingModule } from '@nestjs/testing';
import { ClosService } from './clos.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { createPrismaMock } from 'src/test-utils/prisma.mock';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('ClosService', () => {
  let service: ClosService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ClosService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ClosService>(ClosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll pagination', () => {
    it('returns paginated meta & data with default parameters', async () => {
      const fakeData = [
        {
          id: 1,
          name: 'CLO1',
          thaiDescription: 'คำอธิบาย1',
          engDescription: 'Description1',
          expectSkillLevel: 3,
        },
        {
          id: 2,
          name: 'CLO2',
          thaiDescription: 'คำอธิบาย2',
          engDescription: 'Description2',
          expectSkillLevel: 4,
        },
      ];

      prisma.clo.findMany.mockResolvedValue(fakeData);
      prisma.clo.count.mockResolvedValue(15);

      const result = await service.findAll();

      expect(prisma.clo.findMany).toHaveBeenCalledWith({
        include: { skill: true, plo: true },
        where: {},
        take: 10,
        skip: 0,
      });
      expect(prisma.clo.count).toHaveBeenCalledWith({ where: {} });

      expect(result.data).toHaveLength(2);
      expect(result.meta).toEqual({
        total: 15,
        page: 1,
        limit: 10,
        totalPages: 2,
      });
    });

    it('returns paginated data with custom page and limit', async () => {
      const page = 2;
      const limit = 5;

      const fakeData = Array.from({ length: limit }).map((_, i) => ({
        id: i + 6, // Page 2 starts at item 6
        name: `CLO${i + 6}`,
        thaiDescription: `คำอธิบาย${i + 6}`,
        engDescription: `Description${i + 6}`,
        expectSkillLevel: 3,
      }));

      prisma.clo.findMany.mockResolvedValue(fakeData);
      prisma.clo.count.mockResolvedValue(25);

      const result = await service.findAll({ page, limit });

      expect(prisma.clo.findMany).toHaveBeenCalledWith({
        include: { skill: true, plo: true },
        where: {},
        take: limit,
        skip: (page - 1) * limit,
      });

      expect(result.data).toHaveLength(limit);
      expect(result.meta).toEqual({
        total: 25,
        page,
        limit,
        totalPages: Math.ceil(25 / limit),
      });
    });

    it('filters by subjectId when provided', async () => {
      const subjectId = 123;
      const fakeData = [
        { id: 1, name: 'CLO1', subjectId: 123, expectSkillLevel: 3 },
      ];

      prisma.clo.findMany.mockResolvedValue(fakeData);
      prisma.clo.count.mockResolvedValue(1);

      const result = await service.findAll({ subjectId });

      expect(prisma.clo.findMany).toHaveBeenCalledWith({
        include: { skill: true, plo: true },
        where: { subjectId: Number(subjectId) },
        take: 10,
        skip: 0,
      });
      expect(prisma.clo.count).toHaveBeenCalledWith({
        where: { subjectId: Number(subjectId) },
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].subjectId).toBe(123);
    });

    it('handles empty results', async () => {
      prisma.clo.findMany.mockResolvedValue([]);
      prisma.clo.count.mockResolvedValue(0);

      const result = await service.findAll();

      expect(result.data).toEqual([]);
      expect(result.meta).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });

    it('throws InternalServerErrorException on database error', async () => {
      prisma.clo.findMany.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('returns a CLO when found', async () => {
      const fakeClo = {
        id: 1,
        name: 'CLO1',
        thaiDescription: 'คำอธิบาย',
        engDescription: 'Description',
        expectSkillLevel: 3,
        skill: { id: 1, name: 'Skill1' },
        plo: { id: 1, name: 'PLO1' },
      };

      prisma.clo.findUnique.mockResolvedValue(fakeClo);

      const result = await service.findOne(1);

      expect(prisma.clo.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { skill: true, plo: true },
      });
      expect(result).toEqual(fakeClo);
    });

    it('throws InternalServerErrorException when CLO not found', async () => {
      prisma.clo.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('create', () => {
    it('creates a new CLO successfully', async () => {
      const createDto = {
        name: 'New CLO',
        thaiDescription: 'คำอธิบายใหม่',
        engDescription: 'New Description',
        expectSkillLevel: 4,
        subjectId: 1,
        ploId: 1,
        skillId: 1,
      };

      const createdClo = { id: 1, ...createDto };
      prisma.clo.create.mockResolvedValue(createdClo);

      const result = await service.create(createDto);

      expect(prisma.clo.create).toHaveBeenCalledWith({
        data: {
          name: createDto.name,
          thaiDescription: createDto.thaiDescription,
          engDescription: createDto.engDescription,
          subject: { connect: { id: createDto.subjectId } },
          plo: { connect: { id: createDto.ploId } },
          skill: { connect: { id: createDto.skillId } },
          expectSkillLevel: createDto.expectSkillLevel,
        },
      });
      expect(result).toEqual(createdClo);
    });

    it('creates CLO without optional relations', async () => {
      const createDto = {
        name: 'Simple CLO',
        thaiDescription: 'คำอธิบายง่าย',
        engDescription: 'Simple Description',
        expectSkillLevel: 2,
      };

      const createdClo = { id: 1, ...createDto };
      prisma.clo.create.mockResolvedValue(createdClo);

      const result = await service.create(createDto);

      expect(prisma.clo.create).toHaveBeenCalledWith({
        data: {
          name: createDto.name,
          thaiDescription: createDto.thaiDescription,
          engDescription: createDto.engDescription,
          expectSkillLevel: createDto.expectSkillLevel,
        },
      });
      expect(result).toEqual(createdClo);
    });

    it('throws InternalServerErrorException on creation failure', async () => {
      const createDto = {
        name: 'Failed CLO',
        thaiDescription: 'คำอธิบาย',
        engDescription: 'Description',
        expectSkillLevel: 3,
      };

      prisma.clo.create.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('updates a CLO successfully', async () => {
      const existingClo = { id: 1, name: 'Old CLO' };
      const updateDto = { name: 'Updated CLO' };
      const updatedClo = { id: 1, name: 'Updated CLO' };

      prisma.clo.findUnique.mockResolvedValue(existingClo);
      prisma.clo.update.mockResolvedValue(updatedClo);

      const result = await service.update(1, updateDto);

      expect(prisma.clo.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
      expect(result).toEqual(updatedClo);
    });

    it('throws InternalServerErrorException when CLO to update does not exist', async () => {
      prisma.clo.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Updated' })).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('deletes a CLO successfully', async () => {
      const existingClo = { id: 1, name: 'CLO to delete' };
      prisma.clo.findUnique.mockResolvedValue(existingClo);
      prisma.clo.delete.mockResolvedValue(existingClo);

      const result = await service.remove(1);

      expect(prisma.clo.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(existingClo);
    });

    it('throws InternalServerErrorException when CLO to delete does not exist', async () => {
      prisma.clo.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
