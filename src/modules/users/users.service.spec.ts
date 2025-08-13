import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('UserService (pagination focus)', () => {
  let service: UserService;
  let prisma: {
    user: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll pagination', () => {
    it('returns paginated result with meta (custom page & limit)', async () => {
      const page = 2;
      const limit = 5;

      const fakeData = Array.from({ length: limit }).map((_, i) => ({
        id: i + 1,
        email: `user${i + 1}@mail.com`,
      }));

      prisma.user.findMany.mockResolvedValue(fakeData);
      prisma.user.count.mockResolvedValue(26);

      const result = await service.findAll({
        page,
        limit,
        email: 'user',
        sort: '-id',
      } as any);

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: (page - 1) * limit,
          take: limit,
          // normalized from sort "-id"
          orderBy: { id: 'desc' },
          where: expect.objectContaining({
            email: { contains: 'user' },
          }),
        }),
      );

      expect(result.data).toHaveLength(limit);
      expect(result.meta).toEqual({
        total: 26,
        page,
        limit,
        totalPages: Math.ceil(26 / limit),
      });
    });

    it('applies defaults when page & limit omitted', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      const result = await service.findAll({} as any);

      expect(prisma.user.findMany).toHaveBeenCalledWith(
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
