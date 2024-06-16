import { Subject } from 'src/subjects/entities/subject.entity';

export class CreateSkillDto {
  id: string;

  name: string;

  description: string;

  colorsTag: string;

  subjects: Subject[];
}
