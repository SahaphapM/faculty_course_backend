
import {ApiExtraModels,ApiProperty} from '@nestjs/swagger'
import {IsInt,IsNotEmpty,ValidateNested} from 'class-validator'
import {Type} from 'class-transformer'

export class CourseInstructorInstructorIdCourseIdUniqueInputDto {
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
courseId: number ;
  }

@ApiExtraModels(CourseInstructorInstructorIdCourseIdUniqueInputDto)
export class ConnectCourseInstructorDto {
  @ApiProperty({
  type: CourseInstructorInstructorIdCourseIdUniqueInputDto,
})
@IsNotEmpty()
@ValidateNested()
@Type(() => CourseInstructorInstructorIdCourseIdUniqueInputDto)
instructorId_courseId: CourseInstructorInstructorIdCourseIdUniqueInputDto ;
}
