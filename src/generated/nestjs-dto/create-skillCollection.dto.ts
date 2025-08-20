
import {ApiProperty} from '@nestjs/swagger'
import {IsBoolean,IsInt,IsOptional} from 'class-validator'




export class CreateSkillCollectionDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
  nullable: true,
})
@IsOptional()
@IsInt()
studentId?: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  default: 0,
  required: false,
})
@IsOptional()
@IsInt()
gainedLevel?: number ;
@ApiProperty({
  type: 'boolean',
  default: false,
  required: false,
})
@IsOptional()
@IsBoolean()
passed?: boolean ;
}
