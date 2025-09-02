import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ArrayUnique,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCourseDtoWithInstructor {
  @ApiProperty({
    type: 'boolean',
    default: true,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    // already boolean?
    if (typeof value === 'boolean') return value;

    // string cases
    if (typeof value === 'string') {
      const v = value.trim().toLowerCase();
      if (v === 'true' || v === '1') return true;
      if (v === 'false' || v === '0') return false;
    }

    // anything else -> undefined (means "not provided")
    return undefined;
  })
  active?: boolean | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  @IsNotEmpty()
  @IsInt()
  @Transform(({ value }) => (value ? Number(value) : value))
  semester: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  @IsNotEmpty()
  @IsInt()
  @Transform(({ value }) => (value ? Number(value) : value))
  year: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  @IsNotEmpty()
  @IsInt()
  @Transform(({ value }) => (value ? Number(value) : value))
  subjectId: number;

  @ApiProperty({ type: [Number], example: [1, 2, 3] })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  instructorIds?: number[];
}
