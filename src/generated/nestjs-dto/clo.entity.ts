
import {ApiProperty} from '@nestjs/swagger'
import {Plo} from './plo.entity'
import {Subject} from './subject.entity'
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
subjectId: number  | null;
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
  type: () => Subject,
  required: false,
  nullable: true,
})
subject?: Subject  | null;
@ApiProperty({
  type: () => Skill,
  isArray: true,
  required: false,
})
skills?: Skill[] ;
}
