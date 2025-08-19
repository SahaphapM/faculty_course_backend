import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class InstructorFilterDto extends BaseFilterParams {
  @ApiPropertyOptional({ description: 'Filter by name/code/email', required: false, example: 'Aj. Somchai' })
  @IsOptional()
  @IsString()
  nameCodeMail?: string;

  @ApiPropertyOptional({ description: 'Filter by position', required: false, example: 'Lecturer' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ description: 'Filter by curriculum id', required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  curriculumId?: number;

  @ApiPropertyOptional({ description: 'Filter by branch id', required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  branchId?: number;

  @ApiPropertyOptional({ description: 'Filter by faculty id', required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  facultyId?: number;

  @ApiPropertyOptional({ description: 'Filter by course id', required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  courseId?: number;
}
