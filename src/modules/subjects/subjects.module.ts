import { Module } from '@nestjs/common';
import { CourseSpecsService } from './subjects.service';
import { CourseSpecsController } from './subjects.controller';
import { LessonsService } from '../lessons/lessons.service';

@Module({
  imports: [LessonsService],
  controllers: [CourseSpecsController],
  providers: [CourseSpecsService],
})
export class CourseSpecsModule {}
