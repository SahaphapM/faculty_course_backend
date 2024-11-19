import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';
import { Branch } from 'src/entities/branch.entity';

export class CreateCurriculumDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  engName: string;

  @IsString()
  degree: string;

  @IsString()
  engDegree: string;

  @IsString()
  branch: Branch;

  @IsString()
  description: string;

  @IsNumber()
  period: number;

  @IsNumber()
  minimumGrade: number;

  @ApiProperty({ type: [Number] })
  @IsArray()
  coordinatorListId: number[];

  @ApiProperty({ type: [String] })
  @IsString()
  ploListId: string[];

  @ApiProperty({ type: [String] })
  @IsString()
  subjectListId: string[];
}
