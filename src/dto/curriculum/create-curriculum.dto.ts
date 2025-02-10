import { ApiHideProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Instructor } from 'src/entities/instructor.entity';
import { Branch } from 'src/entities/branch.entity';
import { Plo } from 'src/entities/plo.entity';
import { CourseSpec } from 'src/entities/course-spec.entity';
import { Skill } from 'src/entities/skill.entity';

export class CreateCurriculumDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  thaiName: string;

  @IsString()
  engName: string;

  @IsString()
  thaiDegree: string;

  @IsString()
  engDegree: string;

  @ApiHideProperty()
  @IsObject()
  @IsOptional()
  branch: Branch;

  @IsString()
  thaiDescription: string;

  @IsString()
  engDescription: string;

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
  // @ApiHideProperty() // Hide this Property
  // @IsArray()
  // @IsOptional()
  // subjects: Subject[];

  // send course spec instead
  @ApiHideProperty() // Hide this Property
  @IsArray()
  @IsOptional()
  courseSpecs: CourseSpec[];

  // @ApiProperty({ type: [CreateSkillDto] })
  @ApiHideProperty() // Hide this Property
  @IsArray()
  @IsOptional()
  skills: Skill[];
}
