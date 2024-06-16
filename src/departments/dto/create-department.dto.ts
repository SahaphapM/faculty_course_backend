import { Branch } from 'src/branchs/entities/branch.entity';
import { Faculty } from 'src/faculties/entities/faculty.entity';

export class CreateDepartmentDto {
  id: string;

  name: string;

  branches: Branch[];

  faculty: Faculty;
}
