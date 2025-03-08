import { Module } from '@nestjs/common';
import { CourseService } from './courses.service';
import { CoursesController } from './courses.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StudentsModule } from '../students/students.module';
import { ClosModule } from '../clos/clos.module';

@Module({
  imports: [PrismaModule, StudentsModule, ClosModule],
  controllers: [CoursesController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CoursesModule {}
