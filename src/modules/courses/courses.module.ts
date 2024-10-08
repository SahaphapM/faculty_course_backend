import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'src/entities/course.entity';
import { CourseStudentDetail } from 'src/entities/courseStudentDetail.entity';
import { Student } from 'src/entities/student.entity';
import { SkillCollection } from 'src/entities/skil-collection.entity';
import { StudentsModule } from '../students/students.module';
import { SubjectsModule } from '../subjects/subjects.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      CourseStudentDetail,
      Student,
      SkillCollection,
    ]),
    StudentsModule,
    SubjectsModule,
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
