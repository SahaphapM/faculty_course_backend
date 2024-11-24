import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, Length } from 'class-validator';

export class CreateFacultyDto {
  @IsString()
  name: string;

  @IsString()
  engName: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @Length(2, 10)
  abbrev: string;

  @IsOptional()
  @ApiProperty({ type: [Number] })
  @IsArray()
  branchListId: number[];
}
