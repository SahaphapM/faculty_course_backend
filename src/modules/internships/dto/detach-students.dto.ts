import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, ArrayNotEmpty, IsInt } from 'class-validator';

export class DetachStudentsDto {
  @ApiProperty({ type: [Number], description: 'Student IDs to detach' })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @Transform(({ value }) => (Array.isArray(value) ? value.map((v) => Number(v)) : value))
  @IsInt({ each: true })
  studentIds: number[];
}

