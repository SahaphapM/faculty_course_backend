import { IsOptional } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CloFilterDto extends BaseFilterParams {
  @ApiPropertyOptional({
    description: 'Filter by subject id',
    required: false,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  subjectId?: number;
}
