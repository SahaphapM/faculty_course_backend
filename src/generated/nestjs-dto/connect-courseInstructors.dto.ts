
import {ApiExtraModels,ApiProperty} from '@nestjs/swagger'
import {IsInt,IsNotEmpty,ValidateNested} from 'class-validator'
import {Type} from 'class-transformer'

export class CourseInstructorsInstructorIdCourseIdUniqueInputDto {
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

@ApiExtraModels(CourseInstructorsInstructorIdCourseIdUniqueInputDto)
export class ConnectCourseInstructorsDto {
  @ApiProperty({
  type: CourseInstructorsInstructorIdCourseIdUniqueInputDto,
})
@IsNotEmpty()
@ValidateNested()
@Type(() => CourseInstructorsInstructorIdCourseIdUniqueInputDto)
instructorId_courseId: CourseInstructorsInstructorIdCourseIdUniqueInputDto ;
}
