
import {ApiProperty} from '@nestjs/swagger'


export class CourseInstructorDto {
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
}
