import { IsNumber } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class PloFilterDto extends BaseFilterParams {
  @ApiProperty({
    description: 'Curriculum id',
    required: false,
    example: '321312',
  })
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : value))
  curriculumId: number;
}
