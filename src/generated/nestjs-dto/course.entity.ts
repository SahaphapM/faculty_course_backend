
import {ApiProperty} from '@nestjs/swagger'
import {Subject} from './subject.entity'
import {CourseEnrollment} from './courseEnrollment.entity'
import {CourseInstructor} from './courseInstructor.entity'


export class Course {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
active: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
subjectId: number ;
@ApiProperty({
  type: () => Subject,
  required: false,
})
subject?: Subject ;
@ApiProperty({
  type: () => CourseEnrollment,
  isArray: true,
  required: false,
})
course_enrollments?: CourseEnrollment[] ;
@ApiProperty({
  type: () => CourseInstructor,
  isArray: true,
  required: false,
})
course_instructors?: CourseInstructor[] ;
}
