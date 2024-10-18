import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { SkillLevel } from 'src/enums/skill-level.enum';

export class CreateSkillCollection {
  @IsString()
  subjectId: string;

  @IsString()
  skillId: string;

  @IsString()
  level: SkillLevel;

  @IsNumber()
  score: number;

  @IsBoolean()
  passed: boolean;
}
