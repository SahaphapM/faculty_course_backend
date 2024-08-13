import { Subject } from 'src/subjects/entities/subject.entity';
import { Skill } from '../entities/skill.entity';
import { TechSkill } from 'src/tech-skills/entities/tech-skill.entity';

export class CreateSkillDto {
  id: string;

  name: string;

  description: string;

  subjects: Subject[] | null;

  relatedSkills: Skill[] | null;

  techSkills: TechSkill[] | null;
}
