
import {ApiProperty} from '@nestjs/swagger'
import {IsInt,IsOptional} from 'class-validator'




export class UpdateCourseDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
  default: 1,
  required: false,
  nullable: true,
})
@IsOptional()
@IsInt()
active?: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
@IsOptional()
@IsInt()
subjectId?: number ;
}
