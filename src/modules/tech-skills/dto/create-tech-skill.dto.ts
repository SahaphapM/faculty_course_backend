import { IsString } from 'class-validator';

export class CreateTechSkillDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  description: string;
}
