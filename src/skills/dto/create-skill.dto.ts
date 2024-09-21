import { Skill } from '../entities/skill.entity';
import { TechSkill } from 'src/tech-skills/entities/tech-skill.entity';

export class CreateSkillDto {
  id: number | null;

  name: string;

  description: string;

  domain: string;

  // subjects: Subject[] | null;

  children: Skill[] | null;

  parent: Skill | null;

  techSkills: TechSkill[] | null;
}
