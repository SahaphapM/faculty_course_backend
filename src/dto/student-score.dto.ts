import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class StudentScoreList {
  @ApiProperty()
  @IsString()
  studentCode: string;

  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => {
    // Convert string to number if needed
    return typeof value === 'string' ? Number(value) : value;
  })
  gainedLevel: number;
}
