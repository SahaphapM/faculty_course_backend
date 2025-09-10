
import {ApiProperty} from '@nestjs/swagger'
import {IsBoolean,IsInt,IsOptional,IsString} from 'class-validator'




export class UpdateLevelDescriptionDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
@IsOptional()
@IsInt()
level?: number ;
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
  required: false,
})
@IsOptional()
@IsString()
description?: string ;
@ApiProperty({
  type: 'boolean',
  required: false,
})
@IsOptional()
@IsBoolean()
isHardSkill?: boolean ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
@IsOptional()
@IsInt()
curriculumId?: number ;
}
