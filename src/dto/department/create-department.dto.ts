import { Branch } from 'src/entities/branch.entity';
import { Faculty } from 'src/entities/faculty.entity';

export class CreateDepartmentDto {
  id: string;

  name: string;

  branches: Branch[];

  faculty: Faculty;
}
