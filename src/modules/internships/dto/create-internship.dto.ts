import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreateInternshipDto {
  @IsString()
  readonly companyName: string;

  @IsString()
  readonly position: string;

  @IsDateString()
  readonly startDate: string;

  @IsDateString()
  readonly endDate: string;

  @IsNumber()
  readonly studentId: number;

  @IsOptional()
  @IsString()
  readonly description?: string;
}
