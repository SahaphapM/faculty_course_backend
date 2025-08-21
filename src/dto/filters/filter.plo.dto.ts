import { IsNumber } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';
import { ApiProperty } from '@nestjs/swagger';

export class PloFilterDto extends BaseFilterParams {
  @ApiProperty({
    description: 'Curriculum id',
    required: false,
    example: '321312',
  })
  @IsNumber()
  curriculumId: number;
}
