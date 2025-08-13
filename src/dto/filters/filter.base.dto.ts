import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  IsOptional,
  IsPositive,
  IsInt,
  IsString,
  IsNumber,
  IsEnum,
} from 'class-validator';

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
  @ApiPropertyOptional({
    description:
      'Full-text search term applied to name/code/email/etc (implementation specific)',
    required: false,
    example: 'computer',
  })
  @IsOptional()
  @IsString()
  search?: string;
  // base
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    required: false,
    minimum: 1,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    required: false,
    minimum: 1,
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({
    description:
      'Sort field (prefix with - for descending). Example: "name" or "-createdAt". If absent, service default is used.',
    required: false,
    example: '-id',
  })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({
    description: 'ลำดับการเรียง',
    enum: ['asc', 'desc'],
    example: 'asc',
  })
  @IsOptional()
  @IsString()
  @IsEnum(['asc', 'desc'], {
    message: 'orderBy must be either "asc" or "desc"',
  })
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
