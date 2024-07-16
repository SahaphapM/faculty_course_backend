import { IsString } from 'class-validator';

export class CreateRoleDto {
  id: string | null;

  @IsString()
  name: string;
}
