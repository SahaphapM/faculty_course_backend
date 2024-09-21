import { Skill } from '../entities/skill.entity';
import { TechSkill } from 'src/tech-skills/entities/tech-skill.entity';

export class CreateSkillDto {
  id: string;

  name: string;

  description: string;

  type: string;

  // subjects: Subject[] | null;

  children: Skill[];

  parent: Skill;

  techSkills: TechSkill[] | null;
}
