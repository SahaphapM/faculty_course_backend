
import {ApiProperty} from '@nestjs/swagger'
import {Curriculum} from './curriculum.entity'
import {Coordinator} from './coordinator.entity'


export class CurriculumCoordinators {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
coordinatorId: number ;
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
  type: () => Coordinator,
  required: false,
})
coordinator?: Coordinator ;
}
