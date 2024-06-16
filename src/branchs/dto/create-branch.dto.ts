import { Curriculum } from 'src/curriculums/entities/curriculum.entity';
import { Department } from 'src/departments/entities/department.entity';
import { Faculty } from 'src/faculties/entities/faculty.entity';

export class CreateBranchDto {
  name: string;

  faculty: Faculty;

  department: Department;

  curriculums: Curriculum[];
}
