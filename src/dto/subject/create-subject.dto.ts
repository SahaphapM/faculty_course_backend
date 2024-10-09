import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';
import { Clo } from 'src/entities/clo.entity';
import { Curriculum } from 'src/entities/curriculum.entity';
import { SkillDetail } from 'src/entities/skillDetail.entity';

export class CreateSubjectDto {
  @IsString()
  id: string;

  @IsString()
  thaiName: string;

  @IsString()
  engName: string;

  @IsString()
  description: string;

  @IsNumber()
  credit: number;

  @IsString()
  type: string;

  @IsString()
  studyTime: string;

  @IsOptional()
  @IsArray()
  curriculums?: Curriculum[];

  @IsOptional()
  @IsArray()
  clos?: Clo[];

  @IsOptional()
  @IsArray()
  skillDetails?: SkillDetail[];
}
