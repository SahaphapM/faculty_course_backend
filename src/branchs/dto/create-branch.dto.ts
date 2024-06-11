import { Curriculum } from 'src/curriculums/entities/curriculum.entity';

export class CreateBranchDto {
  name: string;

  // faculty: Faculty;

  // department: Department;

  curriculums: Curriculum[];
}
