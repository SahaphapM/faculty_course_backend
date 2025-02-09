import { Module } from '@nestjs/common';
import { CourseSpecsService } from './course-specs.service';
import { CourseSpecsController } from './course-specs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseSpec } from 'src/entities/course-spec.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseSpec])],
  controllers: [CourseSpecsController],
  providers: [CourseSpecsService],
})
export class CourseSpecsModule {}
