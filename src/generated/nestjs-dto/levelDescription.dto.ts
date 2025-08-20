
import {ApiProperty} from '@nestjs/swagger'


export class LevelDescriptionDto {
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
}
