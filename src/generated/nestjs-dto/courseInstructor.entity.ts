
import {ApiProperty} from '@nestjs/swagger'
import {Instructor} from './instructor.entity'
import {Course} from './course.entity'


export class CourseInstructor {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
instructorId: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
courseId: number ;
@ApiProperty({
  type: () => Instructor,
  required: false,
})
instructor?: Instructor ;
@ApiProperty({
  type: () => Course,
  required: false,
})
course?: Course ;
}
