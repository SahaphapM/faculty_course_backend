
import {ApiExtraModels,ApiProperty} from '@nestjs/swagger'
import {IsInt,IsNotEmpty,IsOptional,ValidateNested} from 'class-validator'
import {Type} from 'class-transformer'

export class StudentInternshipStudentIdInternshipIdUniqueInputDto {
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
internshipId: number ;
  }

@ApiExtraModels(StudentInternshipStudentIdInternshipIdUniqueInputDto)
export class ConnectStudentInternshipDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
@IsOptional()
@IsInt()
id?: number ;
@ApiProperty({
  type: StudentInternshipStudentIdInternshipIdUniqueInputDto,
  required: false,
})
@IsOptional()
@ValidateNested()
@Type(() => StudentInternshipStudentIdInternshipIdUniqueInputDto)
studentId_internshipId?: StudentInternshipStudentIdInternshipIdUniqueInputDto ;
}
