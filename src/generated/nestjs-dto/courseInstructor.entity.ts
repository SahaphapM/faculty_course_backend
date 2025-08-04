
import {ApiProperty} from '@nestjs/swagger'
import {Course} from './course.entity'
import {Instructor} from './instructor.entity'


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
  type: () => Course,
  required: false,
})
course?: Course ;
@ApiProperty({
  type: () => Instructor,
  required: false,
})
instructor?: Instructor ;
}
