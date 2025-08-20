
import {ApiProperty} from '@nestjs/swagger'
import {IsBoolean,IsInt,IsNotEmpty,IsString} from 'class-validator'




export class CreateLevelDescriptionDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
@IsNotEmpty()
@IsInt()
level: number ;
@ApiProperty({
  type: 'string',
})
@IsNotEmpty()
@IsString()
description: string ;
@ApiProperty({
  type: 'boolean',
})
@IsNotEmpty()
@IsBoolean()
isHardSkill: boolean ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
@IsNotEmpty()
@IsInt()
curriculumId: number ;
}
