import { PartialType } from '@nestjs/mapped-types';
import { CreateCurriculumDto } from './create-curriculum.dto';
import { IsNumber } from 'class-validator';

export class UpdateCurriculumDto extends PartialType(CreateCurriculumDto) {
  @IsNumber({ allowNaN: false, allowInfinity: false })
  id: number;
}
