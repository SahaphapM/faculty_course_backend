import { IsNumber, IsOptional } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CloFilterDto extends BaseFilterParams {
  @ApiPropertyOptional({
    description: 'Filter by subject id',
    required: false,
    example: 1,
  })
  @ApiPropertyOptional({
    description: 'Filter by subject id',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => (value === '' ? undefined : Number(value)))
  subjectId?: number;
}
