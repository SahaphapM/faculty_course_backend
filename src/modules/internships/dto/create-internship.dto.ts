import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNumber, IsEnum } from 'class-validator';
import { InternshipStatus } from './internship-filter.dto';
import { Type } from 'class-transformer';

export class CreateInternshipDto {
  @ApiProperty({ description: 'Company ID', example: 1 })
  @IsNumber()
  @Type(() => Number)
  readonly companyId: number;

  @ApiProperty({ description: 'Student ID', example: 1 })
  @IsNumber()
  @Type(() => Number)
  readonly studentId: number;

  @ApiProperty({ description: 'Position at the company', example: 'Software Developer Intern' })
  @IsString()
  readonly position: string;

  @ApiProperty({ description: 'Start date of the internship', example: '2025-08-01' })
  @IsDateString()
  readonly startDate: string;

  @ApiProperty({ description: 'End date of the internship', example: '2025-12-31' })
  @IsDateString()
  readonly endDate: string;

  @ApiProperty({ description: 'Description of the internship', required: false, example: 'Working on backend development' })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiProperty({ description: 'Status of the internship', enum: InternshipStatus, default: InternshipStatus.PENDING })
  @IsOptional()
  @IsEnum(InternshipStatus)
  readonly status?: InternshipStatus = InternshipStatus.PENDING;
}
