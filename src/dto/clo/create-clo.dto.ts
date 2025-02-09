import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCloDto {
  @IsString()
  description: string;

  @IsNotEmpty()
  courseSpecId: number;

  @IsOptional()
  ploId: number;

  @IsOptional()
  skillId: number;
}
