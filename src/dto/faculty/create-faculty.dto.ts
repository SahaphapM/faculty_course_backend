import { Branch } from 'src/entities/branch.entity';
import { Department } from 'src/entities/department.entity';

export class CreateFacultyDto {
  id: string;

  name: string;

  branches: Branch[];

  departments: Department[];
}
