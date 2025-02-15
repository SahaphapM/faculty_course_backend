import { Type } from 'class-transformer';
import { IsOptional, IsPositive, IsInt, IsString } from 'class-validator';

export class PaginationDto {
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

  // most common
  @IsOptional()
  @IsString()
  thaiName?: string;

  @IsOptional()
  @IsString()
  engName?: string;

  @IsOptional()
  @IsString()
  code?: string;

  // for skill
  @IsOptional()
  @IsString()
  name?: string;

  // @IsOptional()
  // @IsString()
  // search?: string;

  // @IsOptional()
  // @IsString()
  // columnId?: string;

  // @IsOptional()
  // @IsString()
  // columnName?: string;

  // @IsOptional()
  // @IsString()
  // bySubject?: string;

  // for curriculum
  @IsOptional()
  @IsString()
  facultyThaiName?: string;

  @IsOptional()
  @IsString()
  facultyEngName?: string;

  @IsOptional()
  @IsString()
  branchThaiName?: string;

  @IsOptional()
  @IsString()
  branchEngName?: string;

  // user
  @IsOptional()
  @IsString()
  email?: string;
}
