
import {ApiProperty} from '@nestjs/swagger'
import {SkillCollection} from './skillCollection.entity'
import {Skill} from './skill.entity'
import {Subject} from './subject.entity'


export class SkillExpectedLevel {
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
expectedLevel: number  | null;
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
subjectId: number  | null;
@ApiProperty({
  type: () => SkillCollection,
  isArray: true,
  required: false,
})
skill_collection?: SkillCollection[] ;
@ApiProperty({
  type: () => Skill,
  required: false,
  nullable: true,
})
skill?: Skill  | null;
@ApiProperty({
  type: () => Subject,
  required: false,
  nullable: true,
})
subject?: Subject  | null;
}
