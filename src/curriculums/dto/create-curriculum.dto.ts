import { Branch } from 'src/branchs/entities/branch.entity';
import { Plo } from 'src/plos/entities/plo.entity';
import { Subject } from 'src/subjects/entities/subject.entity';
import { Teacher } from 'src/teachers/entities/teacher.entity';

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
