// src/logging/dto/audit-log-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseFilterParams } from 'src/dto/filters/filter.base.dto';

export class AuditLogQueryDto extends BaseFilterParams {
  @ApiPropertyOptional({ description: 'User ID to filter', example: 123 })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  userId?: number;

  @ApiPropertyOptional({
    description: 'Action type to filter (CREATE, UPDATE, DELETE, etc.)',
    example: 'UPDATE',
  })
  @IsString()
  @IsOptional()
  action?: string;

  @ApiPropertyOptional({
    description: 'Resource name to filter',
    example: 'faculty',
  })
  @IsString()
  @IsOptional()
  resource?: string;

  @ApiPropertyOptional({
    description: 'Start date (ISO 8601)',
    example: '2025-08-01T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date (ISO 8601)',
    example: '2025-08-06T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Keyword to filter',
    example: 'faculty name or email',
  })
  @IsString()
  @IsOptional()
  keyword?: string;
}
