import { IsString, IsNotEmpty } from 'class-validator';
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
  nameInEnglish: string; // e.g., "MR. SAHAPHAP RITNETIKUL"

  @IsString()
  status: string | null; // e.g., null if no status

  courseStudentDetails: CourseEnrollment[];

  skillCollection: SkillCollection[];
}
