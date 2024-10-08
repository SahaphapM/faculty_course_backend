import { Plo } from 'src/entities/plo.entity';
import { Subject } from 'src/entities/subject.entity';

export class CreateCloDto {
  id: string;

  description: string;

  subject: Subject;

  plo: Plo;
}
