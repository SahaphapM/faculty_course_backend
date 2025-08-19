import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class UpdateUserStudentDto {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: true,
    description: 'Student ID to associate with the user',
  })
  @IsInt()
  studentId: number;
}
