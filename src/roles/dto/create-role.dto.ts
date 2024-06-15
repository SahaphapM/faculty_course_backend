import { IsString } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  id: string;

  @IsString()
  name: string;
}
