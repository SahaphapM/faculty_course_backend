import { IsString, IsArray, IsOptional, IsEnum } from 'class-validator';
import { Clo } from 'src/entities/clo.entity';
import { Curriculum } from 'src/entities/curriculum.entity';
import { SkillExpectedLevel } from 'src/entities/skill-exp-lvl';
import { SubjectType } from 'src/enums/subject-types.enum';

export class CreateSubjectDto {
  @IsString()
  code: string;

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

  @IsArray()
  skillExpectedLevels?: SkillExpectedLevel[];

  // @IsOptional()
  // @IsNumber({ allowNaN: false }, { each: true })
  // skillListId: number[];
}
