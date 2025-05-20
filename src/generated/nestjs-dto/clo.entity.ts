
import {ApiProperty} from '@nestjs/swagger'
import {Plo} from './plo.entity'
import {Subject} from './subject.entity'
import {Skill} from './skill.entity'
import {SkillCollection} from './skillCollection.entity'


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
  type: 'integer',
  format: 'int32',
  nullable: true,
})
skillId: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
expectSkillLevel: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
onTargetLevel: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
aboveTargetLevel: number  | null;
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
  required: false,
  nullable: true,
})
skill?: Skill  | null;
@ApiProperty({
  type: () => SkillCollection,
  isArray: true,
  required: false,
})
skill_collections?: SkillCollection[] ;
}
