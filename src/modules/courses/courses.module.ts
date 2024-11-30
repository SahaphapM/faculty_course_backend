import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'src/entities/course.entity';
import { CourseEnrollment } from 'src/entities/course-enrollment';
import { Student } from 'src/entities/student.entity';
import { SkillCollection } from 'src/entities/skill-collection.entity';
import { StudentsModule } from '../students/students.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { Instructor } from 'src/entities/instructor.entity';
import { InstructorsModule } from '../instructors/instructors.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      CourseEnrollment,
      Student,
      SkillCollection,
      Instructor,
      // Curriculum,
    ]),
    StudentsModule,
    SubjectsModule,
    InstructorsModule
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule { }
