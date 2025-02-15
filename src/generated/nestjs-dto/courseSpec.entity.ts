
import {ApiProperty} from '@nestjs/swagger'
import {Clo} from './clo.entity'
import {Subject} from './subject.entity'
import {Curriculum} from './curriculum.entity'


export class CourseSpec {
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
curriculumId: number  | null;
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
thaiName: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
engName: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
credit: string  | null;
@ApiProperty({
  type: 'string',
})
type: string ;
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
  type: () => Clo,
  isArray: true,
  required: false,
})
clo?: Clo[] ;
@ApiProperty({
  type: () => Subject,
  required: false,
  nullable: true,
})
subject?: Subject  | null;
@ApiProperty({
  type: () => Curriculum,
  required: false,
  nullable: true,
})
curriculum?: Curriculum  | null;
}
