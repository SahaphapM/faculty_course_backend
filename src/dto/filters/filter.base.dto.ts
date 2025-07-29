import { Type, Transform } from 'class-transformer';
import { IsOptional, IsPositive, IsInt, IsString, IsNumber } from 'class-validator';

export type PaginatedResult<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export class BaseFilterParams {
  @IsOptional()
  @IsString()
  search?: string;
  // base
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsString()
  orderBy?: 'asc' | 'desc' = 'asc';
}

export class StudentScoreList {
  @IsString()
  studentCode: string;

  @IsNumber()
  @Transform(({ value }) => {
    // Convert string to number if needed
    return typeof value === 'string' ? Number(value) : value;
  })
  gainedLevel: number;
}
