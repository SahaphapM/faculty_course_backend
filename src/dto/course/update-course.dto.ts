import { PartialType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';
import { CourseEnrollment } from 'src/entities/course-enrollment';
import { IsNotEmpty } from 'class-validator';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @IsNotEmpty()
  courseEnrollments: Partial<CourseEnrollment>[];
}
