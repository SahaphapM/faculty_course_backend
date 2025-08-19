import { IsEmail, IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UserFilterDto extends BaseFilterParams {
  @ApiPropertyOptional({ description: 'Filter by email', required: false, example: 'user@buu.ac.th' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Filter by role', required: false, example: 'admin' })
  @IsOptional()
  @IsString()
  role?: string;
}
