import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Skill } from 'src/entities/skill.entity';

export class CreateSkillDto {
  @IsOptional()
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  domain: string;

  // subjects: Subject[] | null;

  children: Skill[] | null;

  parent: Skill | null;

  // techSkills: TechSkill[] | null;
}
