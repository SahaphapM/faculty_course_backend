import { Plo } from 'src/plos/entities/plo.entity';
import { Subject } from 'src/subjects/entities/subject.entity';

export class CreateCloDto {
  id: string;

  description: string;

  subject: Subject;

  plo: Plo;
}
