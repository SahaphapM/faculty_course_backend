import { Curriculum } from 'src/entities/curriculum.entity';
import { Department } from 'src/entities/department.entity';
import { Faculty } from 'src/entities/faculty.entity';

export class CreateBranchDto {
  name: string;

  faculty: Faculty;

  department: Department;

  curriculums: Curriculum[];
}
