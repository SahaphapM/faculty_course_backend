import { ApiHideProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Skill } from 'src/entities/skill.entity';
import { LearningDomain } from 'src/enums/learning-domain.enum';

export class CreateSkillDto {
  @IsOptional()
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(LearningDomain)
  domain: LearningDomain;

  // subjects: Subject[] | null;
  @ApiHideProperty()
  @IsOptional()
  children: Skill[] | null;

  @IsOptional()
  @IsNumber()
  parentId: number | null;

  @IsNumber()
  curriculumId: number;
}
