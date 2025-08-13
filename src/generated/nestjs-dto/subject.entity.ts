
import {ApiProperty} from '@nestjs/swagger'
import {Clo} from './clo.entity'
import {Course} from './course.entity'
import {Curriculum} from './curriculum.entity'


export class Subject {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'string',
})
code: string ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
curriculumId: number ;
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
  type: 'boolean',
  nullable: true,
})
isRoot: boolean  | null;
@ApiProperty({
  type: () => Clo,
  isArray: true,
  required: false,
})
clos?: Clo[] ;
@ApiProperty({
  type: () => Course,
  isArray: true,
  required: false,
})
courses?: Course[] ;
@ApiProperty({
  type: () => Curriculum,
  required: false,
})
curriculum?: Curriculum ;
}
