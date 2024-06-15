import { Branch } from 'src/branchs/entities/branch.entity';
import { Plo } from 'src/plos/entities/plo.entity';
import { Subject } from 'src/subjects/entities/subject.entity';
import { User } from 'src/users/entities/user.entity';

export class CreateCurriculumDto {
  id: string;

  thaiName: string;

  engName: string;

  phdName: string;

  degreeName: string;

  branch: Branch;

  description: string;

  period: number;

  minimumGrade: number;

  coordinators: User[];

  plos: Plo[];

  subjects: Subject[];
}
