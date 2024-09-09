import {
  IsString,
  IsNumber,
  IsOptional,
  IsDate,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';
import { CourseDetails } from 'src/courses/entities/courseDetails.entity';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  id: string; // e.g., "65160309"

  @IsString()
  @IsNotEmpty()
  nationalId: string; // e.g., "1659700011979"

  @IsString()
  @IsNotEmpty()
  name: string; // e.g., "นายสหภาพ ฤทธิ์เนติกุล"

  @IsString()
  @IsNotEmpty()
  nameInEnglish: string; // e.g., "MR. SAHAPHAP RITNETIKUL"

  @IsString()
  @IsNotEmpty()
  campus: string; // e.g., "Bangsaen"

  @IsString()
  @IsNotEmpty()
  program: string; // e.g., "2134003 B.Sc. (Computer Science) Updated 65 - 4-Year Regular"

  @IsOptional()
  @IsString()
  minor?: string | null; // e.g., "-"

  @IsString()
  @IsNotEmpty()
  educationLevel: string; // e.g., "Bachelor's Degree"

  @IsString()
  @IsNotEmpty()
  degreeName: string; // e.g., "Bachelor of Science B.Sc. (Computer Science) Updated 65 - 4-Year Regular"

  @IsString()
  @IsNotEmpty()
  admissionYear: string; // e.g., "2565 / 1"

  //   @IsDateString()
  admissionDate: string; // e.g., "2022-07-06"

  @IsOptional()
  @IsString()
  status?: string | null; // e.g., null if no status

  @IsString()
  @IsNotEmpty()
  admissionMethod: string; // e.g., "Central Admission"

  @IsString()
  @IsNotEmpty()
  previousQualification: string; // e.g., "High School"

  @IsOptional()
  @IsNumber()
  previousQualificationGPA?: number | null; // e.g., 3.17

  @IsString()
  @IsNotEmpty()
  previousSchool: string; // e.g., "ภาชี สุนทรวิทยานุกูล"

  @IsString()
  @IsNotEmpty()
  advisor: string; // e.g., "Professor Benjaporn Chantarakongkul"

  @IsNumber()
  totalCredits: number; //

  creditsPassed: number; // e.g., 70

  gpa: number; // e.g., 3.54

  courseDetails: CourseDetails[];
}
