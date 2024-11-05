import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { SkillCollection } from '../../entities/skill-collection.entity';
import { CourseEnrollment } from 'src/entities/course-enrollment';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string; // e.g., "นายสหภาพ ฤทธิ์เนติกุล"

  @IsString()
  @IsNotEmpty()
  nameEnglish: string; // e.g., "MR. SAHAPHAP RITNETIKUL"

  @IsOptional()
  @IsString()
  status: string | null; // e.g., null if no status

  @IsOptional()
  @IsString()
  enrollmentDate: string // yyyy-mm-dd

  @IsOptional()
  courseStudentDetails: CourseEnrollment[];

  @IsOptional()
  skillCollection: SkillCollection[];
}
