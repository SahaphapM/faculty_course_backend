import { CreateInternshipDto } from 'src/generated/nestjs-dto/create-internship.dto';
import { CreateStudentInternshipDto } from 'src/generated/nestjs-dto/create-studentInternship.dto';
import { IsArray , ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInternshipWithStudentDto extends CreateInternshipDto {
  @IsArray()
  @Type(() => CreateStudentInternshipDto)
  @ValidateNested({ each: true })
  studentInternships: CreateStudentInternshipDto[];
}
