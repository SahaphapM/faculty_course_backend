import { IsNumber, IsOptional, IsPositive, IsString, Length } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  name: string;

  @IsString()
  engName: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @Length(2, 10)
  abbrev: string;

  @IsNumber()
  @IsPositive()
  facultyId: number;
}
