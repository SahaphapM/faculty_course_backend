import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCloDto {
  @IsString()
  description: string;

  @IsNotEmpty()
  subjectId: string;

  @IsNotEmpty()
  ploId: string;
}
