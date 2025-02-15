
import {ApiProperty} from '@nestjs/swagger'
import {Clo} from './clo.entity'
import {Curriculum} from './curriculum.entity'


export class Plo {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
curriculumId: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'string',
})
type: string ;
@ApiProperty({
  type: 'string',
  nullable: true,
})
name: string  | null;
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
clos?: Clo[] ;
@ApiProperty({
  type: () => Curriculum,
  required: false,
  nullable: true,
})
curriculum?: Curriculum  | null;
}
