import {
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { Clo } from 'src/entities/clo.entity';
import { Curriculum } from 'src/entities/curriculum.entity';
import { SkillDetail } from 'src/entities/skillDetail.entity';
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
  skillDetails?: SkillDetail[];

  @IsOptional()
  @IsNumber({ allowNaN: false }, { each: true })
  skillListId: number[];
}
