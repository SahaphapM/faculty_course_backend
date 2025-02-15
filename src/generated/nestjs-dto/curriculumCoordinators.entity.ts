
import {ApiProperty} from '@nestjs/swagger'
import {Instructor} from './instructor.entity'
import {Curriculum} from './curriculum.entity'


export class CurriculumCoordinators {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
instructorId: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
curriculumId: number ;
@ApiProperty({
  type: () => Instructor,
  required: false,
})
instructor?: Instructor ;
@ApiProperty({
  type: () => Curriculum,
  required: false,
})
curriculum?: Curriculum ;
}
