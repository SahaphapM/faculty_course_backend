
import {ApiExtraModels,ApiProperty} from '@nestjs/swagger'
import {IsInt,IsNotEmpty,ValidateNested} from 'class-validator'
import {Type} from 'class-transformer'

export class CourseInstructorsInstructorInstructorIdCourseIdUniqueInputDto {
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

@ApiExtraModels(CourseInstructorsInstructorInstructorIdCourseIdUniqueInputDto)
export class ConnectCourseInstructorsInstructorDto {
  @ApiProperty({
  type: CourseInstructorsInstructorInstructorIdCourseIdUniqueInputDto,
})
@IsNotEmpty()
@ValidateNested()
@Type(() => CourseInstructorsInstructorInstructorIdCourseIdUniqueInputDto)
instructorId_courseId: CourseInstructorsInstructorInstructorIdCourseIdUniqueInputDto ;
}
