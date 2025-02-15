
import {ApiExtraModels,ApiProperty} from '@nestjs/swagger'
import {IsInt,IsNotEmpty,ValidateNested} from 'class-validator'
import {Type} from 'class-transformer'

export class CurriculumCoordinatorsInstructorInstructorIdCurriculumIdUniqueInputDto {
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

@ApiExtraModels(CurriculumCoordinatorsInstructorInstructorIdCurriculumIdUniqueInputDto)
export class ConnectCurriculumCoordinatorsInstructorDto {
  @ApiProperty({
  type: CurriculumCoordinatorsInstructorInstructorIdCurriculumIdUniqueInputDto,
})
@IsNotEmpty()
@ValidateNested()
@Type(() => CurriculumCoordinatorsInstructorInstructorIdCurriculumIdUniqueInputDto)
instructorId_curriculumId: CurriculumCoordinatorsInstructorInstructorIdCurriculumIdUniqueInputDto ;
}
