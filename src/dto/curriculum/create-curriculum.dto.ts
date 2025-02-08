import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Instructor } from 'src/entities/instructor.entity';
import { Plo } from 'src/entities/plo.entity';
import { Subject } from 'src/entities/subject.entity';
import { CreateSkillDto } from '../skill/create-skill.dto';

export class CreateCurriculumDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  name: string;

  @IsString()
  engName: string;

  @IsString()
  degree: string;

  @IsString()
  engDegree: string;

  @IsNumber()
  @IsOptional()
  branchId: number;

  @IsString()
  description: string;

  @IsNumber()
  period: number | 3;

  @IsNumber() minimumGrade: number | 3;

  // @ApiProperty({ type: [String] })
  // @IsArray()
  // coordinatorListId: string[];

  // @ApiProperty({ type: [String] })
  // @IsString()
  // ploListId: string[];

  // @ApiProperty({ type: [String] })
  // @IsArray()
  // subjectListId: string[];

  @ApiProperty({ type: [Instructor] })
  @IsArray()
  @IsOptional()
  coordinators: Instructor[];

  @ApiProperty({ type: [Plo] })
  @IsArray()
  @IsOptional()
  plos: Plo[];

  @ApiProperty({ type: [Subject] })
  @IsArray()
  @IsOptional()
  subjects: Subject[];

  @ApiProperty({ type: [CreateSkillDto] })
  @IsArray()
  @IsOptional()
  skills: CreateSkillDto[];
}
