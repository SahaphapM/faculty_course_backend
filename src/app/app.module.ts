import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from '../modules/users/users.module';
import { SubjectsModule } from '../modules/subjects/subjects.module';
import { PlosModule } from '../modules/plos/plos.module';
import { SkillsModule } from '../modules/skills/skills.module';
import { FacultiesModule } from '../modules/faculties/faculties.module';
// import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { StudentsModule } from '../modules/students/students.module';
import { CurriculumsModule } from 'src/modules/curriculums/curriculums.module';
import { BranchesModule } from 'src/modules/branches/branches.module';
import { ClosModule } from 'src/modules/clos/clos.module';
import { CoursesModule } from 'src/modules/courses/courses.module';
import { CourseSpecsModule } from 'src/modules/course-specs/course-specs.module';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // Serve files from 'public' directory
      serveRoot: '/public', // URL path to serve static files
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UsersModule,
    CurriculumsModule,
    BranchesModule,
    SubjectsModule,
    PlosModule,
    ClosModule,
    SkillsModule,
    FacultiesModule,
    // AuthModule,
    StudentsModule,
    CoursesModule,
    CourseSpecsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
