
import {ApiProperty} from '@nestjs/swagger'
import {IsBoolean,IsInt,IsOptional,IsString} from 'class-validator'




export class UpdateCourseDto {
  @ApiProperty({
  type: 'boolean',
  default: true,
  required: false,
  nullable: true,
})
@IsOptional()
@IsBoolean()
active?: boolean  | null;
@ApiProperty({
  type: 'string',
  required: false,
})
@IsOptional()
@IsString()
semester?: string ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
@IsOptional()
@IsInt()
year?: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
@IsOptional()
@IsInt()
subjectId?: number ;
}
