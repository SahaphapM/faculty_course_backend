import { PartialType } from '@nestjs/swagger';
import { CreateCourseSpecDto } from './create-course-spec.dto';
import { IsNumber } from 'class-validator';

export class UpdateCourseSpecDto extends PartialType(CreateCourseSpecDto) {
  @IsNumber({ allowNaN: false, allowInfinity: false })
  id: number;
}
