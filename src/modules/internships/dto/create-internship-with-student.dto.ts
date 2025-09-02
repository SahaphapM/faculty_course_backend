import { CreateInternshipDto } from 'src/generated/nestjs-dto/create-internship.dto';
import { CreateStudentInternshipDto } from 'src/generated/nestjs-dto/create-studentInternship.dto';
import { IsArray , IsNumber, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInternshipWithStudentDto extends CreateInternshipDto {
  @IsArray()
  @Type(() => CreateStudentInternshipDto)
  @ValidateNested({ each: true })
  @ApiProperty({ type: () => CreateStudentInternshipDto, isArray: true })
  studentInternships: CreateStudentInternshipDto[];

  @ApiProperty({ type: Number })
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : value))
  curriculumId: number;
}
