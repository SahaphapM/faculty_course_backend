
import {ApiProperty} from '@nestjs/swagger'
import {Curriculum} from './curriculum.entity'


export class LevelDescription {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
level: number ;
@ApiProperty({
  type: 'string',
})
name: string ;
@ApiProperty({
  type: 'string',
})
description: string ;
@ApiProperty({
  type: 'boolean',
})
isHardSkill: boolean ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
curriculumId: number ;
@ApiProperty({
  type: () => Curriculum,
  required: false,
})
curriculum?: Curriculum ;
}
