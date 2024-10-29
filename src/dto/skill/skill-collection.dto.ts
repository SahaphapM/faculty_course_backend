import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateSkillCollection {
  @IsString()
  subjectId: string;

  @IsString()
  skillId: string;

  @IsNumber()
  level: number;

  @IsNumber()
  gainedLevel: number;

  @IsBoolean()
  passed: boolean;
}
