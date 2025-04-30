import { Type } from 'class-transformer';
import { IsOptional, IsPositive, IsInt, IsString } from 'class-validator';

export class BaseFilterParams {
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
  studentCode: string;
  gainedLevel: number;
}
