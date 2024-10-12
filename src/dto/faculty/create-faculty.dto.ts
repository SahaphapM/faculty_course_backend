import { IsArray, IsString } from 'class-validator';

export class CreateFacultyDto {
  id: string;

  @IsString()
  name: string;

  @IsArray()
  branchListId: number[];

  // departments: Department[];
}
