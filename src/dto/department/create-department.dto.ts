import { IsString } from 'class-validator';
import { Branch } from 'src/entities/branch.entity';
import { Faculty } from 'src/entities/faculty.entity';

export class CreateDepartmentDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  branches: Branch[];

  faculty: Faculty;
}
