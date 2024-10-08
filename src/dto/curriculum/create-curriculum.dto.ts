import { Branch } from 'src/entities/branch.entity';
import { Plo } from 'src/entities/plo.entity';
import { Subject } from 'src/entities/subject.entity';
import { Teacher } from 'src/entities/teacher.entity';

export class CreateCurriculumDto {
  id: string;

  thaiName: string;

  engName: string;

  thaiDegreeName: string;

  engDegreeName: string;

  branch: Branch;

  description: string;

  period: number;

  minimumGrade: number;

  coordinators: Teacher[];

  plos: Plo[];

  subjects: Subject[];
}
