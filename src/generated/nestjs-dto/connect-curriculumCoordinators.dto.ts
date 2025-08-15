
import {ApiExtraModels,ApiProperty} from '@nestjs/swagger'
import {IsInt,IsNotEmpty,ValidateNested} from 'class-validator'
import {Type} from 'class-transformer'

export class CurriculumCoordinatorsCoordinatorIdCurriculumIdUniqueInputDto {
    @ApiProperty({
  type: 'integer',
  format: 'int32',
})
@IsNotEmpty()
@IsInt()
coordinatorId: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
@IsNotEmpty()
@IsInt()
curriculumId: number ;
  }

@ApiExtraModels(CurriculumCoordinatorsCoordinatorIdCurriculumIdUniqueInputDto)
export class ConnectCurriculumCoordinatorsDto {
  @ApiProperty({
  type: CurriculumCoordinatorsCoordinatorIdCurriculumIdUniqueInputDto,
})
@IsNotEmpty()
@ValidateNested()
@Type(() => CurriculumCoordinatorsCoordinatorIdCurriculumIdUniqueInputDto)
coordinatorId_curriculumId: CurriculumCoordinatorsCoordinatorIdCurriculumIdUniqueInputDto ;
}
