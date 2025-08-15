
import {ApiProperty} from '@nestjs/swagger'
import {IsInt,IsOptional} from 'class-validator'




export class UpdateCurriculumCoordinatorsDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
@IsOptional()
@IsInt()
coordinatorId?: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
@IsOptional()
@IsInt()
curriculumId?: number ;
}
