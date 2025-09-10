import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, Min } from 'class-validator';

export class UpdateGraduationDateDto {
  @ApiProperty({ description: 'Curriculum ID whose students will be updated' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  curriculumId: number;

  @ApiProperty({ description: 'Graduation date to set for all students in the curriculum', type: String, example: '2025-05-31' })
  @IsDate()
  @Type(() => Date)
  graduationDate: Date;
}

