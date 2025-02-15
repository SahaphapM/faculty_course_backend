
import {ApiProperty} from '@nestjs/swagger'
import {Subject} from './subject.entity'
import {CourseEnrollment} from './courseEnrollment.entity'
import {CourseInstructorsInstructor} from './courseInstructorsInstructor.entity'


export class Course {
  @ApiProperty({
  type: 'string',
})
name: string ;
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
  nullable: true,
})
subjectId: number  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
thaiDescription: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
engDescription: string  | null;
@ApiProperty({
  type: () => Subject,
  required: false,
  nullable: true,
})
subject?: Subject  | null;
@ApiProperty({
  type: () => CourseEnrollment,
  isArray: true,
  required: false,
})
course_enrollment?: CourseEnrollment[] ;
@ApiProperty({
  type: () => CourseInstructorsInstructor,
  isArray: true,
  required: false,
})
course_instructors_instructor?: CourseInstructorsInstructor[] ;
}
