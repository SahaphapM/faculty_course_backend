import { Clo } from 'src/entities/clo.entity';
import { Curriculum } from 'src/entities/curriculum.entity';

export class CreatePloDto {
  id: string;
  num_plo: string;
  description: string;
  resultTypes: string;
  curriculum: Curriculum;
  clos: Clo[];
}
