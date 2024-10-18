import { IsString, IsArray, IsOptional, IsNumber } from 'class-validator';
import { Clo } from 'src/entities/clo.entity';
import { Curriculum } from 'src/entities/curriculum.entity';
import { SkillDetail } from 'src/entities/skillDetail.entity';

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

  @IsString()
  type: string;

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
