import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';
import { Curriculum } from 'src/curriculums/entities/curriculum.entity';
import { Clo } from 'src/clos/entities/clo.entity';
import { Skill } from 'src/skills/entities/skill.entity';
import { User } from 'src/users/entities/user.entity';

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
  skills?: Skill[];
}
