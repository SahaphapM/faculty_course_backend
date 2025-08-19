import { IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BranchFilterDto extends BaseFilterParams {
  @ApiPropertyOptional({ description: 'Thai name (contains)', required: false, example: 'ภาควิชา' })
  @IsOptional()
  @IsString()
  thaiName?: string;

  @ApiPropertyOptional({ description: 'English name (contains)', required: false, example: 'Department' })
  @IsOptional()
  @IsString()
  engName?: string;
}
