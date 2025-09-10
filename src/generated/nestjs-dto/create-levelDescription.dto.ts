
import {ApiProperty} from '@nestjs/swagger'
import {IsBoolean,IsInt,IsNotEmpty,IsOptional,IsString} from 'class-validator'




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
  default: '',
  required: false,
})
@IsOptional()
@IsString()
name?: string ;
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
