
import {ApiProperty} from '@nestjs/swagger'
import {Course} from './course.entity'
import {Instructor} from './instructor.entity'


export class CourseInstructor {
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
instructorId: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
courseId: number  | null;
@ApiProperty({
  type: () => Course,
  required: false,
  nullable: true,
})
course?: Course  | null;
@ApiProperty({
  type: () => Instructor,
  required: false,
  nullable: true,
})
instructor?: Instructor  | null;
}
