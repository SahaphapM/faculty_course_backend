import { Type } from 'class-transformer';
import { IsOptional, IsPositive, IsInt, IsString } from 'class-validator';

export class PaginationDto {
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
  order?: 'ASC' | 'DESC' = 'ASC';

  @IsOptional()
  @IsString()
  search?: string;

  // @IsOptional()
  // @IsString()
  // byFaculty?: string;

  // @IsOptional()
  // @IsString()
  // byBranch?: string;

  @IsOptional()
  @IsString()
  bySubject?: string;
}
