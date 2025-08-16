import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { CourseInstructorDto } from 'src/generated/nestjs-dto/courseInstructor.dto';

export class InstructorIds {
  @ApiProperty({ type: [Number], example: [1, 2, 3] })
  instructorIds: number[];
}

export class CreateCourseDtoWithInstructor {
  @ApiProperty({
    type: 'boolean',
    default: true,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  @IsNotEmpty()
  @IsInt()
  semester: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  @IsNotEmpty()
  @IsInt()
  year: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  @IsNotEmpty()
  @IsInt()
  subjectId: number;

  @ApiProperty({
    type: [CourseInstructorDto],
    required: false,
    nullable: true,
  })
  @IsOptional()
  course_instructors?: CourseInstructorDto[];
}
