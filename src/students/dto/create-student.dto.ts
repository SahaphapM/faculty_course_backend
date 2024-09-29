import { IsString, IsNotEmpty } from 'class-validator';
import { SkillCollection } from '../entities/skil-collection.entity';
import { CourseStudentDetail } from 'src/courses/entities/courseStudentDetail.entity';

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

  courseStudentDetails: CourseStudentDetail[];

  skillCollection: SkillCollection[];
}
