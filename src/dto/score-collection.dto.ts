import { IsNumber } from 'class-validator';

type StudentScore = {
  studentCode: string;
  gained: number;
  expected: number;
};

export class ScoreSkillCollectionDto {
  @IsNumber()
  branchId: number;
  
  @IsNumber()
  cloId: number;

  @IsNumber()
  skillId: number;

  students: StudentScore[];
}
