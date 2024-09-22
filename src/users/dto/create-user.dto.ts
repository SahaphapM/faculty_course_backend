import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from 'src/roles/entities/role.entity';

export class CreateUserDto {
  @IsString()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  avatarUrl: string;

  @IsNotEmpty()
  roles: Role[];

  // curriculums: Curriculum[];
}
