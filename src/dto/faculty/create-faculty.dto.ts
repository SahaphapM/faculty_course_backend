import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class CreateFacultyDto {
  // id: number;

  @IsString()
  name: string;

  @ApiProperty({ type: [Number] })
  @IsArray()
  branchListId: number[];

  // departments: Department[];
}
