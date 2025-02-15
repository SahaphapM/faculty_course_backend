
import {ApiExtraModels,ApiProperty} from '@nestjs/swagger'
import {IsInt,IsNotEmpty,ValidateNested} from 'class-validator'
import {Type} from 'class-transformer'

export class CurriculumSubjectsSubjectCurriculumIdSubjectIdUniqueInputDto {
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

@ApiExtraModels(CurriculumSubjectsSubjectCurriculumIdSubjectIdUniqueInputDto)
export class ConnectCurriculumSubjectsSubjectDto {
  @ApiProperty({
  type: CurriculumSubjectsSubjectCurriculumIdSubjectIdUniqueInputDto,
})
@IsNotEmpty()
@ValidateNested()
@Type(() => CurriculumSubjectsSubjectCurriculumIdSubjectIdUniqueInputDto)
curriculumId_subjectId: CurriculumSubjectsSubjectCurriculumIdSubjectIdUniqueInputDto ;
}
