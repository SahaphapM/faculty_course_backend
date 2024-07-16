import { Clo } from 'src/clos/entities/clo.entity';
import { Curriculum } from 'src/curriculums/entities/curriculum.entity';

export class CreatePloDto {
  id: string;
  Plo: string;
  description: string;
  resultTypes: string;
  curriculum: Curriculum;
  clos: Clo[];
}
