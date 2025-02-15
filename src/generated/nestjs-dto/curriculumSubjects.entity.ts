
import {ApiProperty} from '@nestjs/swagger'
import {Subject} from './subject.entity'
import {Curriculum} from './curriculum.entity'


export class CurriculumSubjects {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
curriculumId: number ;
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
  type: () => Curriculum,
  required: false,
})
curriculum?: Curriculum ;
}
