
import {ApiExtraModels,ApiProperty} from '@nestjs/swagger'
import {IsInt,IsNotEmpty,IsOptional,ValidateNested} from 'class-validator'
import {Type} from 'class-transformer'

export class SkillCollectionStudentIdCourseIdCloIdUniqueInputDto {
    @ApiProperty({
  type: 'integer',
  format: 'int32',
})
@IsNotEmpty()
@IsInt()
studentId: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
@IsNotEmpty()
@IsInt()
courseId: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
@IsNotEmpty()
@IsInt()
cloId: number ;
  }

@ApiExtraModels(SkillCollectionStudentIdCourseIdCloIdUniqueInputDto)
export class ConnectSkillCollectionDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
@IsOptional()
@IsInt()
id?: number ;
@ApiProperty({
  type: SkillCollectionStudentIdCourseIdCloIdUniqueInputDto,
  required: false,
})
@IsOptional()
@ValidateNested()
@Type(() => SkillCollectionStudentIdCourseIdCloIdUniqueInputDto)
studentId_courseId_cloId?: SkillCollectionStudentIdCourseIdCloIdUniqueInputDto ;
}
