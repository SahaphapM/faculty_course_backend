import { IsNotEmpty, IsString } from 'class-validator';
import { Role } from 'src/roles/entities/role.entity';

export class CreateUserDto {
  @IsString()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  roles: Role[];

  // curriculums: Curriculum[];
}
