import { Test, TestingModule } from '@nestjs/testing';
import { SkillsService } from './skills.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { createPrismaMock } from 'src/test-utils/prisma.mock';
import {
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PaginatedResult } from 'src/dto/filters/filter.base.dto';
import { Curriculum } from 'src/generated/nestjs-dto/curriculum.entity';
import { Skill } from 'src/generated/nestjs-dto/skill.entity';

/**
 * Helper to build a fully-typed Skill-like object with required fields.
 * Add/override only what a test needs. Ensures compatibility with the strongly
 * typed Prisma deep mock (id, thaiName, engName, thaiDescription, engDescription,
 * domain, parentId, curriculumId, subs).
 */
const buildSkill = (overrides: Partial<any> = {}) => ({
  id: 1,
  thaiName: 'ทักษะA',
  engName: 'Skill A',
  thaiDescription: 'คำอธิบาย TH',
  engDescription: 'Description EN',
  domain: 'Technical',
  parentId: null,
  curriculumId: 1,
  subs: [],
  ...overrides,
});

describe('SkillsService', () => {
  let service: SkillsService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [SkillsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll pagination', () => {
    it('returns paginated meta & data with default parameters', async () => {
      const fakeData = [
        buildSkill({ id: 1 }),
        buildSkill({ id: 2, thaiName: 'ทักษะB', engName: 'Skill B' }),
      ];

      prisma.skill.findMany.mockResolvedValue(fakeData);
      prisma.skill.count.mockResolvedValue(15);

      const result = await service.findAll({});

      expect(prisma.skill.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        orderBy: { id: 'asc' },
        include: expect.objectContaining({
          subs: expect.any(Object),
        }),
        where: { parentId: null },
      });
      expect(prisma.skill.count).toHaveBeenCalledWith({
        where: { parentId: null },
      });

      expect((result as PaginatedResult<any>).data).toHaveLength(2);
      expect((result as PaginatedResult<any>).meta).toEqual({
        total: 15,
        page: 1,
        limit: 10,
        totalPages: 2,
      });
    });

    it('returns paginated data with custom page and limit', async () => {
      const page = 3;
      const limit = 5;

      const fakeData = Array.from({ length: limit }).map((_, i) =>
        buildSkill({
          id: i + 11, // Page 3 starts at item 11
          thaiName: `ทักษะ${i + 11}`,
          engName: `Skill${i + 11}`,
        }),
      );

      prisma.skill.findMany.mockResolvedValue(fakeData);
      prisma.skill.count.mockResolvedValue(25);

      const result = await service.findAll({ page, limit });

      expect(prisma.skill.findMany).toHaveBeenCalledWith({
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { id: 'asc' },
        include: expect.objectContaining({
          subs: expect.any(Object),
        }),
        where: { parentId: null },
      });

      expect((result as PaginatedResult<any>).data).toHaveLength(limit);
      expect((result as PaginatedResult<any>).meta).toEqual({
        total: 25,
        page,
        limit,
        totalPages: Math.ceil(25 / limit),
      });
    });

    it('filters by nameCode (searches both thai and english names)', async () => {
      const nameCode = 'Programming';
      const fakeData = [
        buildSkill({
          id: 1,
          thaiName: 'การเขียนโปรแกรม',
          engName: 'Programming',
        }),
      ];

      prisma.skill.findMany.mockResolvedValue(fakeData);
      prisma.skill.count.mockResolvedValue(1);

      const result = await service.findAll({ nameCode });

      expect(prisma.skill.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        orderBy: { id: 'asc' },
        include: expect.objectContaining({
          subs: expect.any(Object),
        }),
        where: {
          parentId: null,
          OR: [
            { thaiName: { contains: nameCode } },
            { engName: { contains: nameCode } },
          ],
        },
      });

      expect((result as PaginatedResult<any>).data).toHaveLength(1);
      expect((result as PaginatedResult<any>).data[0].engName).toContain(
        'Programming',
      );
    });

    it('filters by domain when provided', async () => {
      const domain = 'Soft Skills';
      const fakeData = [
        buildSkill({
          id: 1,
          thaiName: 'การสื่อสาร',
          engName: 'Communication',
          domain: 'Soft Skills',
        }),
      ];

      prisma.skill.findMany.mockResolvedValue(fakeData);
      prisma.skill.count.mockResolvedValue(1);

      const result = await service.findAll({ domain });

      expect(prisma.skill.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        orderBy: { id: 'asc' },
        include: expect.objectContaining({
          subs: expect.any(Object),
        }),
        where: {
          parentId: null,
          domain,
        },
      });

      expect((result as PaginatedResult<any>).data).toHaveLength(1);
      expect((result as PaginatedResult<any>).data[0].domain).toBe(domain);
    });

    it('applies custom sorting', async () => {
      const fakeData = [
        buildSkill({ id: 2, thaiName: 'ทักษะB', engName: 'Skill B' }),
        buildSkill({ id: 1 }),
      ];

      prisma.skill.findMany.mockResolvedValue(fakeData);
      prisma.skill.count.mockResolvedValue(2);

      const result = await service.findAll({
        sort: 'engName',
        orderBy: 'desc',
      });

      expect(prisma.skill.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        orderBy: { engName: 'desc' },
        include: expect.objectContaining({
          subs: expect.any(Object),
        }),
        where: { parentId: null },
      });

      expect((result as PaginatedResult<any>).data).toHaveLength(2);
    });

    it('handles empty sort field gracefully', async () => {
      const fakeData = [];

      prisma.skill.findMany.mockResolvedValue(fakeData);
      prisma.skill.count.mockResolvedValue(0);

      const result = await service.findAll({ sort: '' });

      expect(prisma.skill.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        orderBy: { id: 'asc' },
        include: expect.objectContaining({
          subs: expect.any(Object),
        }),
        where: { parentId: null },
      });

      expect((result as PaginatedResult<any>).data).toEqual([]);
    });

    it('returns raw skills array when no pagination params provided', async () => {
      const fakeData = [buildSkill({ id: 1 })];

      prisma.skill.findMany.mockResolvedValue(fakeData);
      prisma.skill.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result).toEqual(fakeData);
      expect(result).not.toHaveProperty('meta');
    });

    it('handles empty results', async () => {
      prisma.skill.findMany.mockResolvedValue([]);
      prisma.skill.count.mockResolvedValue(0);

      const result = await service.findAll({});

      expect((result as PaginatedResult<any>).data).toEqual([]);
      expect((result as PaginatedResult<any>).meta).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });
  });

  describe('findByCurriculum pagination', () => {
    it('returns paginated skills for a specific curriculum', async () => {
      const curriculumId = 5;
      const fakeData = [
        buildSkill({
          id: 1,
          thaiName: 'ทักษะคอมพิวเตอร์',
          engName: 'Computer Skills',
          curriculumId: 5,
        }),
      ];

      prisma.skill.findMany.mockResolvedValue(fakeData);
      prisma.skill.count.mockResolvedValue(3);

      const result = await service.findByCurriculum(curriculumId, {
        page: 1,
        limit: 15,
      });

      expect(prisma.skill.findMany).toHaveBeenCalledWith({
        take: 15,
        skip: 0,
        orderBy: { id: 'asc' },
        include: expect.objectContaining({
          subs: expect.any(Object),
        }),
        where: {
          parentId: null,
          curriculumId: curriculumId,
        },
      });

      expect((result as PaginatedResult<any>).data).toHaveLength(1);
      expect((result as PaginatedResult<any>).meta).toEqual({
        total: 3,
        page: 1,
        limit: 15,
        totalPages: 1,
      });
    });

    it('returns raw skills array when no pagination params provided for curriculum', async () => {
      const curriculumId = 5;
      const fakeData = [
        buildSkill({
          id: 1,
          thaiName: 'ทักษะคอมพิวเตอร์',
          engName: 'Computer Skills',
          curriculumId: 5,
        }),
      ];

      prisma.skill.findMany.mockResolvedValue(fakeData);
      prisma.skill.count.mockResolvedValue(1);

      const result = await service.findByCurriculum(curriculumId);

      expect(result).toEqual(fakeData);
      expect(result).not.toHaveProperty('meta');
    });
  });

  describe('findByBranch pagination', () => {
    it('returns paginated skills for a specific branch', async () => {
      const branchId = 3;
      const fakeData = [
        buildSkill({
          id: 1,
          thaiName: 'วิศวกรรมซอฟต์แวร์',
          engName: 'Software Engineering',
        }),
      ];

      prisma.skill.findMany.mockResolvedValue(fakeData);
      prisma.skill.count.mockResolvedValue(8);

      const result = await service.findByBranch(branchId, {
        page: 2,
        limit: 5,
      });

      expect(prisma.skill.findMany).toHaveBeenCalledWith({
        take: 5,
        skip: 5,
        orderBy: { id: 'asc' },
        include: expect.objectContaining({
          subs: expect.any(Object),
        }),
        where: {
          parentId: null,
          OR: expect.arrayContaining([
            { curriculum: { branchId: branchId } },
            { subs: { some: { curriculum: { branchId: branchId } } } },
            expect.objectContaining({
              subs: {
                some: {
                  subs: {
                    some: {
                      curriculum: {
                        branchId: branchId,
                      },
                    },
                  },
                },
              },
            }),
          ]),
        },
      });

      expect((result as PaginatedResult<any>).data).toHaveLength(1);
      expect((result as PaginatedResult<any>).meta).toEqual({
        total: 8,
        page: 2,
        limit: 5,
        totalPages: 2,
      });
    });
  });

  describe('findByFaculty pagination', () => {
    it('returns paginated skills for a specific faculty', async () => {
      const facultyId = 2;
      const fakeData = [
        buildSkill({
          id: 1,
          thaiName: 'ทักษะวิศวกรรม',
          engName: 'Engineering Skills',
        }),
      ];

      prisma.skill.findMany.mockResolvedValue(fakeData);
      prisma.skill.count.mockResolvedValue(12);

      const result = await service.findByFaculty(facultyId, {
        page: 1,
        limit: 10,
      });

      expect(prisma.skill.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        orderBy: { id: 'asc' },
        include: expect.objectContaining({
          subs: expect.any(Object),
        }),
        where: {
          parentId: null,
          OR: expect.arrayContaining([
            { curriculum: { branch: { facultyId: facultyId } } },
            {
              subs: {
                some: { curriculum: { branch: { facultyId: facultyId } } },
              },
            },
            expect.objectContaining({
              subs: {
                some: {
                  subs: {
                    some: {
                      curriculum: {
                        branch: {
                          facultyId: facultyId,
                        },
                      },
                    },
                  },
                },
              },
            }),
          ]),
        },
      });

      expect((result as PaginatedResult<any>).data).toHaveLength(1);
      expect((result as PaginatedResult<any>).meta).toEqual({
        total: 12,
        page: 1,
        limit: 10,
        totalPages: 2,
      });
    });
  });

  describe('findBySubject pagination', () => {
    it('returns paginated skills for a specific subject', async () => {
      const subjectId = 7;
      const fakeData = [
        buildSkill({
          id: 1,
          thaiName: 'การคิดเชิงนามธรรม',
          engName: 'Abstract Thinking',
          domain: 'Cognitive',
        }),
      ];

      prisma.skill.findMany.mockResolvedValue(fakeData);
      prisma.skill.count.mockResolvedValue(5);

      const result = await service.findBySubject(subjectId, {
        page: 1,
        limit: 10,
      });

      expect(prisma.skill.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        orderBy: { id: 'asc' },
        include: expect.objectContaining({
          subs: expect.any(Object),
        }),
        where: {
          parentId: null,
          OR: expect.arrayContaining([
            { clos: { some: { subjectId } } },
            { subs: { some: { clos: { some: { subjectId } } } } },
            expect.objectContaining({
              subs: {
                some: {
                  subs: {
                    some: {
                      clos: { some: { subjectId } },
                    },
                  },
                },
              },
            }),
          ]),
        },
      });

      expect((result as PaginatedResult<any>).data).toHaveLength(1);
      expect((result as PaginatedResult<any>).meta).toEqual({
        total: 5,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });

  describe('findOptions', () => {
    it('returns skills without subs for a curriculum', async () => {
      const curriculumId = 5;
      const fakeData = [
        buildSkill({ id: 1, thaiName: 'ทักษะA', engName: 'Skill A' }),
        buildSkill({ id: 2, thaiName: 'ทักษะB', engName: 'Skill B' }),
      ];

      prisma.skill.findMany.mockResolvedValue(fakeData);

      const result = await service.findOptions(curriculumId);

      expect(prisma.skill.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          thaiName: true,
          engName: true,
          subs: true,
        },
        where: {
          curriculumId,
          subs: {
            none: {},
          },
        },
      });

      expect(result).toEqual(fakeData);
    });
  });

  describe('findOne', () => {
    it('returns a skill with nested subs when found', async () => {
      const fakeSkill = buildSkill({
        id: 1,
        thaiName: 'ทักษะหลัก',
        engName: 'Main Skill',
        subs: [
          buildSkill({
            id: 2,
            thaiName: 'ทักษะย่อย',
            engName: 'Sub Skill',
            parentId: 1,
            subs: [],
          }),
        ],
        parent: null,
      });

      prisma.skill.findUnique.mockResolvedValue(fakeSkill);

      const result = await service.findOne(1);

      expect(prisma.skill.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          subs: {
            include: {
              subs: {
                include: {
                  subs: true,
                },
              },
            },
          },
          parent: true,
        },
      });
      expect(result).toEqual(fakeSkill);
    });

    it('throws InternalServerErrorException when skill not found', async () => {
      prisma.skill.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('throws InternalServerErrorException on database error', async () => {
      prisma.skill.findUnique.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.findOne(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('create', () => {
    it('creates a new skill successfully', async () => {
      const createDto = {
        thaiName: 'ทักษะใหม่',
        engName: 'New Skill',
        thaiDescription: 'คำอธิบายใหม่ TH',
        engDescription: 'New description EN',
        domain: 'Technical',
        curriculumId: 1,
      };

      const fakeCurriculum = { id: 1, thaiName: 'หลักสูตรA' } as Curriculum;
      const createdSkill = { id: 1, ...createDto } as Skill;

      prisma.curriculum.findUnique.mockResolvedValue(fakeCurriculum);
      prisma.skill.create.mockResolvedValue(createdSkill);

      const result = await service.create(createDto);

      expect(prisma.curriculum.findUnique).toHaveBeenCalledWith({
        where: { id: createDto.curriculumId },
      });
      expect(prisma.skill.create).toHaveBeenCalledWith({
        data: {
          thaiName: createDto.thaiName,
          engName: createDto.engName,
          domain: createDto.domain,
          curriculumId: createDto.curriculumId,
        },
      });
      expect(result).toEqual(createdSkill);
    });

    it('throws NotFoundException when curriculum not found', async () => {
      const createDto = {
        thaiName: 'ทักษะใหม่',
        engName: 'New Skill',
        thaiDescription: 'คำอธิบายใหม่ TH',
        engDescription: 'New description EN',
        domain: 'Technical',
        curriculumId: 999,
      };

      prisma.curriculum.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws BadRequestException on creation failure', async () => {
      const createDto = {
        thaiName: 'ทักษะใหม่',
        engName: 'New Skill',
        thaiDescription: 'คำอธิบายใหม่ TH',
        engDescription: 'New description EN',
        domain: 'Technical',
        curriculumId: 1,
      };

      const fakeCurriculum = { id: 1, thaiName: 'หลักสูตรA' } as Curriculum;
      prisma.curriculum.findUnique.mockResolvedValue(fakeCurriculum);
      prisma.skill.create.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('updates a skill successfully', async () => {
      const updateDto = { thaiName: 'ทักษะที่อัพเดทแล้ว' };
      const updatedSkill = buildSkill({
        id: 1,
        thaiName: 'ทักษะที่อัพเดทแล้ว',
        engName: 'Updated Skill',
      });

      prisma.skill.update.mockResolvedValue(updatedSkill);

      const result = await service.update(1, updateDto);

      expect(prisma.skill.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
      expect(result).toEqual(updatedSkill);
    });

    it('throws NotFoundException when skill to update does not exist', async () => {
      const updateDto = { thaiName: 'Updated Skill' };
      const error: any = new Error('Record not found');
      error.code = 'P2025';

      prisma.skill.update.mockRejectedValue(error);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws BadRequestException on other update failures', async () => {
      const updateDto = { thaiName: 'Updated Skill' };
      prisma.skill.update.mockRejectedValue(new Error('Database error'));

      await expect(service.update(1, updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('deletes a skill successfully', async () => {
      const deletedSkill = buildSkill({
        id: 1,
        thaiName: 'Deleted Skill',
        engName: 'Deleted Skill',
      });
      prisma.skill.delete.mockResolvedValue(deletedSkill);

      const result = await service.remove(1);

      expect(prisma.skill.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(deletedSkill);
    });

    it('throws NotFoundException when skill to delete does not exist', async () => {
      const error: any = new Error('Record not found');
      error.code = 'P2025';

      prisma.skill.delete.mockRejectedValue(error);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException on other deletion failures', async () => {
      prisma.skill.delete.mockRejectedValue(new Error('Database error'));

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });
  });
});
