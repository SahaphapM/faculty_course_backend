import { IsString, IsNotEmpty } from 'class-validator';
import { CourseDetail } from 'src/courses/entities/courseDetail.entity';
import { SkillCollection } from '../entities/skil-collection';

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

  courseDetails: CourseDetail[];

  skillCollection: SkillCollection[];
}
