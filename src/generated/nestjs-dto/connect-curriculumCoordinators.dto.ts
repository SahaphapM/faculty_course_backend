
import {ApiExtraModels,ApiProperty} from '@nestjs/swagger'
import {IsInt,IsNotEmpty,ValidateNested} from 'class-validator'
import {Type} from 'class-transformer'

export class CurriculumCoordinatorsInstructorIdCurriculumIdUniqueInputDto {
    @ApiProperty({
  type: 'integer',
  format: 'int32',
})
@IsNotEmpty()
@IsInt()
instructorId: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
@IsNotEmpty()
@IsInt()
curriculumId: number ;
  }

@ApiExtraModels(CurriculumCoordinatorsInstructorIdCurriculumIdUniqueInputDto)
export class ConnectCurriculumCoordinatorsDto {
  @ApiProperty({
  type: CurriculumCoordinatorsInstructorIdCurriculumIdUniqueInputDto,
})
@IsNotEmpty()
@ValidateNested()
@Type(() => CurriculumCoordinatorsInstructorIdCurriculumIdUniqueInputDto)
instructorId_curriculumId: CurriculumCoordinatorsInstructorIdCurriculumIdUniqueInputDto ;
}
