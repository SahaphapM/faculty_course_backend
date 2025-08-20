
import {ApiProperty} from '@nestjs/swagger'
import {IsInt,IsOptional,IsString} from 'class-validator'




export class UpdateSkillAssessmentDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
  default: 0,
  required: false,
  nullable: true,
})
@IsOptional()
@IsInt()
curriculumLevel?: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  default: 0,
  required: false,
  nullable: true,
})
@IsOptional()
@IsInt()
companyLevel?: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  default: 0,
  required: false,
  nullable: true,
})
@IsOptional()
@IsInt()
finalLevel?: number  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
@IsOptional()
@IsString()
curriculumComment?: string  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
@IsOptional()
@IsString()
companyComment?: string  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
  nullable: true,
})
@IsOptional()
@IsInt()
skillId?: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
  nullable: true,
})
@IsOptional()
@IsInt()
studentId?: number  | null;
}
