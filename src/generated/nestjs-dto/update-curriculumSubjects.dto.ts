
import {ApiProperty} from '@nestjs/swagger'
import {IsInt,IsOptional} from 'class-validator'




export class UpdateCurriculumSubjectsDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
@IsOptional()
@IsInt()
subjectId?: number ;
}
