import { IsString } from 'class-validator';

export class CreateTechSkillDto {
  @IsString()
  slug: string;

  @IsString()
  name: string;

  @IsString()
  description: string;
}
