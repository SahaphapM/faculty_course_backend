import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { InternshipStatus } from './internship-filter.dto';

export class UpdateInternshipStatusDto {
  @ApiProperty({
    description: 'Status of the internship',
    enum: InternshipStatus,
    example: InternshipStatus.ACTIVE
  })
  @IsEnum(InternshipStatus)
  status: InternshipStatus;
}