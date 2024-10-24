import {
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { Clo } from 'src/entities/clo.entity';
import { Curriculum } from 'src/entities/curriculum.entity';
import { SkillExpectedLevel } from 'src/entities/skillExpectedLevel';
import { SubjectType } from 'src/enums/subject-types.enum';

export class CreateSubjectDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  engName: string;

  @IsString()
  description: string;

  @IsString()
  credit: string;

  @IsEnum(SubjectType)
  type: SubjectType;

  @IsOptional()
  @IsArray()
  curriculums?: Curriculum[];

  @IsOptional()
  @IsArray()
  clos?: Clo[];

  @IsOptional()
  @IsArray()
  expectedLevels?: SkillExpectedLevel[];

  @IsOptional()
  @IsNumber({ allowNaN: false }, { each: true })
  skillListId: number[];
}
