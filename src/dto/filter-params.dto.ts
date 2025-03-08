import { Type } from 'class-transformer';
import {
  IsOptional,
  IsPositive,
  IsInt,
  IsString,
  IsNumber,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class FilterParams {
  // base
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
  orderBy?: 'asc' | 'desc' = 'asc';

  // most common
  @IsOptional()
  @IsString()
  thaiName?: string;

  @IsOptional()
  @IsString()
  engName?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  curriculumCode?: string;

  // for skill
  @IsOptional()
  @IsString()
  name?: string;

  // for clo
  @IsOptional()
  @IsString()
  subjectId?: number;

  // for curriculum
  @IsOptional()
  @IsString()
  facultyThaiName?: string;

  @IsOptional()
  @IsString()
  facultyEngName?: string;

  @IsOptional()
  @IsString()
  branchThaiName?: string;

  @IsOptional()
  @IsString()
  branchEngName?: string;

  // user
  @IsOptional()
  @IsString()
  email?: string;
}

export class StudentScoreList {
  @ApiProperty({
    type: 'string',
    required: true,
    nullable: false,
    example: '6400000001',
  })
  @IsString()
  studentCode: string;

  @ApiProperty({
    type: 'integer',
    required: true,
    nullable: false,
    example: 5,
  })
  @IsNumber()
  gained: number;
}
