
import {ApiProperty} from '@nestjs/swagger'
import {Clo} from './clo.entity'
import {Curriculum} from './curriculum.entity'
import {SkillExpectedLevel} from './skillExpectedLevel.entity'


export class Skill {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'string',
})
thaiName: string ;
@ApiProperty({
  type: 'string',
})
engName: string ;
@ApiProperty({
  type: 'string',
})
thaiDescription: string ;
@ApiProperty({
  type: 'string',
})
engDescription: string ;
@ApiProperty({
  type: 'string',
})
domain: string ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
parentId: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
cloId: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
curriculumId: number ;
@ApiProperty({
  type: () => Skill,
  required: false,
  nullable: true,
})
parent?: Skill  | null;
@ApiProperty({
  type: () => Skill,
  isArray: true,
  required: false,
})
subs?: Skill[] ;
@ApiProperty({
  type: () => Clo,
  required: false,
  nullable: true,
})
clo?: Clo  | null;
@ApiProperty({
  type: () => Curriculum,
  required: false,
})
curriculum?: Curriculum ;
@ApiProperty({
  type: () => SkillExpectedLevel,
  isArray: true,
  required: false,
})
skill_expected_level?: SkillExpectedLevel[] ;
}
