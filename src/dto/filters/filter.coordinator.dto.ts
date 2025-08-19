import {  IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CoordinatorFilterDto extends BaseFilterParams {
  @ApiPropertyOptional({ description: 'Filter by name/code/email', required: false, example: 'Somchai' })
  @IsOptional()
  @IsString()
  nameCodeMail?: string;

  @ApiPropertyOptional({ description: 'Filter by position', required: false, example: 'Coordinator' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ description: 'Filter by curriculum id', required: false, example: '1' })
  @IsOptional()
  @IsString()
  curriculumId?: string;
}
