import { IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FacultyFilterDto extends BaseFilterParams {
  @ApiPropertyOptional({ description: 'Faculty code', required: false, example: 'ENG' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Thai name', required: false, example: 'คณะวิศวกรรมศาสตร์' })
  @IsOptional()
  @IsString()
  thaiName?: string;

  @ApiPropertyOptional({ description: 'English name', required: false, example: 'Faculty of Engineering' })
  @IsOptional()
  @IsString()
  engName?: string;
}
