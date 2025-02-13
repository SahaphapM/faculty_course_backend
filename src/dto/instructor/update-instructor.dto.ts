import { PartialType } from '@nestjs/mapped-types';
import { CreateInstructorDto } from './create-instructor.dto';
import { IsNumber } from 'class-validator';

export class UpdateInstructorDto extends PartialType(CreateInstructorDto) {
  @IsNumber({ allowNaN: false, allowInfinity: false })
  id: number;
}
