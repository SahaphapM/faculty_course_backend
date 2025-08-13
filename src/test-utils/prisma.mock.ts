/**
 * Strongly typed Prisma mock utilities using jest-mock-extended.
 *
 * This replaces the previous handcrafted model-by-model mock with a single
 * DeepMockProxy of the real generated PrismaClient, giving you:
 *  - Full & current typing (auto-updates when your Prisma schema changes)
 *  - Access to every model & method (including $transaction, $queryRaw, etc.)
 *  - Simple reset between tests
 *
 * Installation note:
 *  Ensure `jest-mock-extended` is installed (it was already used previously).
 *
 * Typical usage inside a test:
 *  import { createPrismaMock, resetPrismaMock, buildPaginatedFixture, PrismaMock } from 'src/test-utils/prisma.mock';
 *  import { PrismaService } from 'src/prisma/prisma.service';
 *
 *  describe('CompanyService', () => {
 *    let prisma: PrismaMock;
 *    let service: CompanyService;
 *
 *    beforeEach(async () => {
 *      prisma = createPrismaMock();
 *
 *      const module = await Test.createTestingModule({
 *        providers: [
 *          CompanyService,
 *          { provide: PrismaService, useValue: prisma },
 *        ],
 *      }).compile();
 *
 *      service = module.get(CompanyService);
 *    });
 *
 *    afterEach(() => {
 *      resetPrismaMock(prisma);
 *    });
 *
 *    it('returns a paginated list', async () => {
 *      const page = 2;
 *      const limit = 5;
 *      const fixture = buildPaginatedFixture(23, page, limit, (i) => ({
 *        id: i + 1,
 *        name: `Company ${i + 1}`,
 *      }));
 *
 *      prisma.company.findMany.mockResolvedValue(fixture.data as any);
 *      prisma.company.count.mockResolvedValue(fixture.total);
 *
 *      const result = await service.findAll({ page, limit });
 *      expect(result.meta).toEqual({
 *        total: fixture.total,
 *        page,
 *        limit,
 *        totalPages: fixture.totalPages,
 *      });
 *    });
 *  });
 */

import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

/**
 * Export a convenient alias for the deep mock type of PrismaClient.
 * DeepMockProxy ensures nested model methods (e.g. prisma.user.findMany) are typed & mocked.
 */
export type PrismaMock = DeepMockProxy<PrismaClient>;

/**
 * Create a fresh deep mock of PrismaClient.
 *
 * We do NOT call $connect(), so no real DB connections occur.
 * If you need to change default behavior globally (e.g. middlewares) you can do it here.
 */
export function createPrismaMock(
  initializer?: (mock: PrismaMock) => void,
): PrismaMock {
  const mock = mockDeep<PrismaClient>();

  // Optional: provide default behaviors here if helpful for most tests
  // e.g. mock.$transaction.mockImplementation(async (fn: any) => fn(mock));

  if (initializer) {
    initializer(mock);
  }
  return mock;
}

/**
 * Reset all internal Jest mock state (calls, instances, results) on a previously created PrismaMock.
 * This is preferable to creating a brand new mock when you want to retain the reference
 * already injected into a testing module.
 */
export function resetPrismaMock(mock: PrismaMock): void {
  mockReset(mock);
}

/**
 * Convenience helper to construct a paginated fixture for list endpoints.
 * Returns deterministically generated data plus pagination metadata.
 *
 * total: total number of records across all pages
 * page: current 1-based page
 * limit: page size
 * factory: (index) => builds an item for global zero-based index
 */
export function buildPaginatedFixture<T>(
  total: number,
  page: number,
  limit: number,
  factory: (index: number) => T,
): {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const safeLimit = limit || 1;
  const start = (page - 1) * safeLimit;
  const end = Math.min(start + safeLimit, total);
  const data: T[] = [];
  for (let i = start; i < end; i++) {
    data.push(factory(i));
  }
  return {
    data,
    total,
    page,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };
}

/**
 * Additional helper examples (uncomment if useful):
 *
 * // Create a helper to stub a standard findMany + count pair for pagination:
 * export function stubPaginated<ModelEntity>(
 *   prismaModel: { findMany: jest.Mock; count: jest.Mock },
 *   fixture: { data: ModelEntity[]; total: number }
 * ) {
 *   prismaModel.findMany.mockResolvedValue(fixture.data as any);
 *   prismaModel.count.mockResolvedValue(fixture.total);
 * }
 */
