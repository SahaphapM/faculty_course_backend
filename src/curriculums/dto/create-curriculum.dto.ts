import { Branch } from 'src/branchs/entities/branch.entity';
import { User } from 'src/users/entities/user.entity';

export class CreateCurriculumDto {
  thaiName: string;

  engName: string;

  phdName: string;

  degreeName: string;

  branch: Branch;

  description: string;

  period: number;

  minimumGrade: number;

  curriculumCoordinator: User[];
}
