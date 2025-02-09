import { PartialType } from '@nestjs/swagger';
import { CreateCourseSpecDto } from './create-course-spec.dto';

export class UpdateCourseSpecDto extends PartialType(CreateCourseSpecDto) {}
