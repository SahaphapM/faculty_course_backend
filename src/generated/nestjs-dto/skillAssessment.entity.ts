
import {ApiProperty} from '@nestjs/swagger'
import {Skill} from './skill.entity'
import {Student} from './student.entity'


export class SkillAssessment {
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
curriculumLevel: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
companyLevel: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
finalLevel: number  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
curriculumComment: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
companyComment: string  | null;
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
studentId: number  | null;
@ApiProperty({
  type: () => Skill,
  required: false,
  nullable: true,
})
skill?: Skill  | null;
@ApiProperty({
  type: () => Student,
  required: false,
  nullable: true,
})
student?: Student  | null;
}
