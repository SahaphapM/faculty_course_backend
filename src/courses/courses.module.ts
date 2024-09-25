import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseDetail } from './entities/courseDetail.entity';
import { Student } from 'src/students/entities/student.entity';
import { StudentsModule } from 'src/students/students.module';
import { SubjectsModule } from 'src/subjects/subjects.module';
import { SkillCollection } from 'src/students/entities/skil-collection.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, CourseDetail, Student, SkillCollection]),
    StudentsModule,
    SubjectsModule,
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
