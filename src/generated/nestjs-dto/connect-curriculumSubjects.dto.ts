
import {ApiExtraModels,ApiProperty} from '@nestjs/swagger'
import {IsInt,IsNotEmpty,ValidateNested} from 'class-validator'
import {Type} from 'class-transformer'

export class CurriculumSubjectsCurriculumIdSubjectIdUniqueInputDto {
    @ApiProperty({
  type: 'integer',
  format: 'int32',
})
@IsNotEmpty()
@IsInt()
curriculumId: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
@IsNotEmpty()
@IsInt()
subjectId: number ;
  }

@ApiExtraModels(CurriculumSubjectsCurriculumIdSubjectIdUniqueInputDto)
export class ConnectCurriculumSubjectsDto {
  @ApiProperty({
  type: CurriculumSubjectsCurriculumIdSubjectIdUniqueInputDto,
})
@IsNotEmpty()
@ValidateNested()
@Type(() => CurriculumSubjectsCurriculumIdSubjectIdUniqueInputDto)
curriculumId_subjectId: CurriculumSubjectsCurriculumIdSubjectIdUniqueInputDto ;
}
