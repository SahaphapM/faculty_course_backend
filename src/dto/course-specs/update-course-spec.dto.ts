import { PartialType } from '@nestjs/swagger';
import { CreateCourseSpecDto } from './create-course-spec.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateCourseSpecDto extends PartialType(CreateCourseSpecDto) {
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsOptional()
  id: number;
}
