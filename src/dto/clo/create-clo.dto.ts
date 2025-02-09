import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCloDto {
  @IsString()
  name: string;

  @IsString()
  engDescription: string;

  @IsString()
  thaiDescription: string;

  @IsNotEmpty()
  courseSpecId: number;

  @IsOptional()
  ploId: number;

  @IsOptional()
  skillId: number;
}
