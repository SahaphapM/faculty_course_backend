import { Curriculum } from 'src/curriculums/entities/curriculum.entity';
import { Role } from 'src/roles/entities/role.entity';

export class CreateUserDto {
  id: string | null;

  email: string;

  password: string;

  firstName: string;

  middleName: string;

  lastName: string;

  gender: string;

  googleId: string;

  roles: Role[];

  phone: string;

  curriculums: Curriculum[];
}
