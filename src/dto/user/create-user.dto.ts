import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from 'src/enums/role.enum';

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
  role: UserRole

}
