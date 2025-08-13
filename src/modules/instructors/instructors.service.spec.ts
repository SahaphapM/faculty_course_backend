import { Test, TestingModule } from '@nestjs/testing';
import { InstructorsService } from './instructors.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('InstructorsService (pagination focus)', () => {
  let service: InstructorsService;
  let prisma: {
    instructor: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    curriculum_coordinators: {
      upsert: jest.Mock;
      deleteMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      instructor: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      curriculum_coordinators: {
        upsert: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstructorsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<InstructorsService>(InstructorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll pagination', () => {
    it('returns paginated result with meta (custom page & limit & filters)', async () => {
      const page = 2;
      const limit = 4;

      const fakeData = Array.from({ length: limit }).map((_, i) => ({
        id: i + 1,
        code: `T${i + 1}`,
        thaiName: `อาจารย์${i + 1}`,
        engName: `Teacher${i + 1}`,
        email: `t${i + 1}@mail.com`,
      }));

      prisma.instructor.findMany.mockResolvedValue(fakeData);
      prisma.instructor.count.mockResolvedValue(19);

      const result = await service.findAll({
        page,
        limit,
        nameCodeMail: 'T',
        sort: 'id',
        orderBy: 'desc',
        branchId: 3,
      } as any);

      expect(prisma.instructor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: (page - 1) * limit,
          // service uses provided limit or default
          take: limit,
          orderBy: { id: 'desc' },
          where: expect.objectContaining({
            OR: expect.any(Array),
            branchId: 3,
          }),
        }),
      );

      expect(result.data).toHaveLength(limit);
      expect(result.meta).toEqual({
        total: 19,
        page,
        limit,
        totalPages: Math.ceil(19 / limit),
      });
    });

    it('applies defaults when page & limit omitted', async () => {
      prisma.instructor.findMany.mockResolvedValue([]);
      prisma.instructor.count.mockResolvedValue(0);

      const result = await service.findAll({} as any);

      expect(prisma.instructor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10, // defaultLimit in service
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
