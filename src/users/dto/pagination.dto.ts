import { Type } from 'class-transformer';
import { IsOptional, IsPositive, IsInt } from 'class-validator';

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
}
