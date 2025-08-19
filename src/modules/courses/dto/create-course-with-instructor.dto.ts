import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
} from 'class-validator';

// export class InstructorIds {
//   @ApiProperty({ type: [Number], example: [1, 2, 3] })
//   @IsArray()
//   @ArrayNotEmpty()
//   @ArrayUnique()
//   @IsInt({ each: true })
//   instructorIds: number[];
// }


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

  @ApiProperty({ type: [Number], example: [1, 2, 3] })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  @IsOptional()
  instructorIds: number[];
}
