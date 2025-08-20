import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StudentsBySkillLevelFilterDto extends BaseFilterParams {
  @ApiProperty({
    description: 'Target level comparison',
    enum: ['on', 'above', 'below', 'all'],
    example: 'on',
  })
  @IsEnum(['on', 'above', 'below', 'all'])
  targetLevel: 'on' | 'above' | 'below' | 'all';

  @ApiPropertyOptional({
    description: 'Year code to filter by',
    required: false,
    example: '2567',
  })
  @IsOptional()
  @IsString()
  yearCode?: string;

  @ApiPropertyOptional({
    description: 'Year to filter by',
    required: false,
    example: '2567',
  })
  @IsOptional()
  @IsString()
  year?: string;
}
