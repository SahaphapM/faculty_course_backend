
import {ApiProperty} from '@nestjs/swagger'
import {Curriculum} from './curriculum.entity'
import {Instructor} from './instructor.entity'


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
  type: () => Curriculum,
  required: false,
})
curriculum?: Curriculum ;
@ApiProperty({
  type: () => Instructor,
  required: false,
})
instructor?: Instructor ;
}
