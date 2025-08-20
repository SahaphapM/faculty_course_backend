
import {ApiExtraModels,ApiProperty} from '@nestjs/swagger'
import {IsInt,IsNotEmpty,IsOptional,ValidateNested} from 'class-validator'
import {Type} from 'class-transformer'

export class SkillAssessmentSkillIdStudentIdUniqueInputDto {
    @ApiProperty({
  type: 'integer',
  format: 'int32',
})
@IsNotEmpty()
@IsInt()
skillId: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
@IsNotEmpty()
@IsInt()
studentId: number ;
  }

@ApiExtraModels(SkillAssessmentSkillIdStudentIdUniqueInputDto)
export class ConnectSkillAssessmentDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
@IsOptional()
@IsInt()
id?: number ;
@ApiProperty({
  type: SkillAssessmentSkillIdStudentIdUniqueInputDto,
  required: false,
})
@IsOptional()
@ValidateNested()
@Type(() => SkillAssessmentSkillIdStudentIdUniqueInputDto)
skillId_studentId?: SkillAssessmentSkillIdStudentIdUniqueInputDto ;
}
