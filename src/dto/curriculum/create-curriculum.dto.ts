import { ApiHideProperty } from '@nestjs/swagger';
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
import { Skill } from 'src/entities/skill.entity';

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

  // @ApiProperty({ type: [Instructor] })
  @ApiHideProperty() // Hide this Property
  @IsArray()
  @IsOptional()
  coordinators: Instructor[];

  // @ApiProperty({ type: [Plo] })
  @ApiHideProperty() // Hide this Property
  @IsArray()
  @IsOptional()
  plos: Plo[];

  // @ApiProperty({ type: [Subject] })
  @ApiHideProperty() // Hide this Property
  @IsArray()
  @IsOptional()
  subjects: Subject[];

  // @ApiProperty({ type: [CreateSkillDto] })
  @ApiHideProperty() // Hide this Property
  @IsArray()
  @IsOptional()
  skills: Skill[];
}
