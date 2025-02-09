import { Module } from '@nestjs/common';
import { CourseSpecsService } from './course-specs.service';
import { CourseSpecsController } from './course-specs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseSpec } from 'src/entities/course-spec.entity';
import { Subject } from 'src/entities/subject.entity';
import { Curriculum } from 'src/entities/curriculum.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseSpec, Subject, Curriculum])],
  controllers: [CourseSpecsController],
  providers: [CourseSpecsService],
})
export class CourseSpecsModule {}
