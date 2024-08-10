import { Subject } from 'src/subjects/entities/subject.entity';
import { Skill } from '../entities/skill.entity';
import { TechSkill } from 'src/tech-skills/entities/tech-skill.entity';

export class CreateSkillDto {
  id: string;

  name: string;

  description: string;

  colorsTag: string;

  subjects: Subject[];

  relatedSkills: Skill[];

  techSkills: TechSkill[];
}
