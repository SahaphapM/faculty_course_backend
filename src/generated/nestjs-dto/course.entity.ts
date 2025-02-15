
import {ApiProperty} from '@nestjs/swagger'
import {CourseEnrollment} from './courseEnrollment.entity'
import {CourseInstructors} from './courseInstructors.entity'


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
  type: () => CourseEnrollment,
  isArray: true,
  required: false,
})
course_enrollment?: CourseEnrollment[] ;
@ApiProperty({
  type: () => CourseInstructors,
  isArray: true,
  required: false,
})
course_instructors?: CourseInstructors[] ;
}
