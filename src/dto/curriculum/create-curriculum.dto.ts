import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { Instructor } from 'src/entities/instructor.entity';
import { Plo } from 'src/entities/plo.entity';
import { Skill } from 'src/entities/skill.entity';
import { Subject } from 'src/entities/subject.entity';

export class CreateCurriculumDto {
  // @IsString()
  // id: string;

  @IsString()
  name: string;

  @IsString()
  engName: string;

  @IsString()
  degree: string;

  @IsString()
  engDegree: string;

  @IsString()
  @IsOptional()
  branchId: string;

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
  @IsString()
  @IsOptional()
  plos: Plo[];

  @ApiProperty({ type: [Subject] })
  @IsArray()
  @IsOptional()
  subjects: Subject[];

  @ApiProperty({ type: [Skill] })
  @IsArray()
  @IsOptional()
  skills: Skill[];
}
