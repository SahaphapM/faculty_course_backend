
import {ApiProperty} from '@nestjs/swagger'
import {Plo} from './plo.entity'
import {CourseSpec} from './courseSpec.entity'
import {Skill} from './skill.entity'


export class Clo {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'string',
  nullable: true,
})
name: string  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
ploId: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
courseSpecId: number  | null;
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
  type: () => Plo,
  required: false,
  nullable: true,
})
plo?: Plo  | null;
@ApiProperty({
  type: () => CourseSpec,
  required: false,
  nullable: true,
})
course_spec?: CourseSpec  | null;
@ApiProperty({
  type: () => Skill,
  isArray: true,
  required: false,
})
skills?: Skill[] ;
}
