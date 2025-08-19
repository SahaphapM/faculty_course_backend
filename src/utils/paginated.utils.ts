import type { PaginatedData } from "src/dto/pagination.dto";

/**
 * Utility to build a PaginatedResult<T> object.
 * Reuses the shared PaginatedResult type declared in filter.base.dto.ts
 */
export function createPaginatedData<T>(
  data: T[],
  total: number,
  page: number = 1,
  limit: number = 10,
): PaginatedData<T> {
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / (limit || 1)),
    },
  };
}
