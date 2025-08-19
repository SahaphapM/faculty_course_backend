import { IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PloFilterDto extends BaseFilterParams {
  @ApiPropertyOptional({ description: 'Curriculum code (contains)', required: false, example: 'CS' })
  @IsOptional()
  @IsString()
  curriculumCode?: string;
}
