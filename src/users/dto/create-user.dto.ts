import { IsString } from 'class-validator';
import { Curriculum } from 'src/curriculums/entities/curriculum.entity';
import { Role } from 'src/roles/entities/role.entity';

export class CreateUserDto {
  id: string | null;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  middleName: string;

  @IsString()
  lastName: string;

  @IsString()
  gender: string;

  googleId: string;

  roles: Role[];

  @IsString()
  phone: string;

  curriculums: Curriculum[];
}
