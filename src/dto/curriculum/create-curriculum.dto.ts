import { ApiHideProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Instructor } from 'src/entities/instructor.entity';
import { UpdateCourseSpecDto } from '../course-specs/update-course-spec.dto';
import { UpdatePloDto } from '../plo/update-plo.dto';
import { UpdateSkillDto } from '../skill/update-skill.dto';

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
  plos: UpdatePloDto[];

  // @ApiProperty({ type: [Subject] })
  // @ApiHideProperty() // Hide this Property
  // @IsArray()
  // @IsOptional()
  // subjects: Subject[];

  // send course spec instead
  @ApiHideProperty() // Hide this Property
  @IsArray()
  @IsOptional()
  courseSpecs: UpdateCourseSpecDto[];

  // @ApiProperty({ type: [CreateSkillDto] })
  @ApiHideProperty() // Hide this Property
  @IsArray()
  @IsOptional()
  skills: UpdateSkillDto[];
}
