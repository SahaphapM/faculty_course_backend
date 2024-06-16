import { Branch } from 'src/branchs/entities/branch.entity';
import { Department } from 'src/departments/entities/department.entity';

export class CreateFacultyDto {
  id: string;

  name: string;

  branches: Branch[];

  departments: Department[];
}
