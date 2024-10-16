import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateRoleDto } from '../role/create-role.dto';

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
  roles: CreateRoleDto[];

  // curriculums: Curriculum[];
}
