import { HttpStatus, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from '../modules/users/users.module';
import { LessonModule } from '../modules/lessons/lessons.module';
import { PlosModule } from '../modules/plos/plos.module';
import { SkillsModule } from '../modules/skills/skills.module';
import { FacultiesModule } from '../modules/faculties/faculties.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { StudentsModule } from '../modules/students/students.module';
import { CurriculumsModule } from 'src/modules/curriculums/curriculums.module';
import { BranchesModule } from 'src/modules/branches/branches.module';
import { ClosModule } from 'src/modules/clos/clos.module';
import { CoursesModule } from 'src/modules/courses/courses.module';
import { SubjectModule } from 'src/modules/subjects/subjects.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { InstructorsModule } from 'src/modules/instructors/instructors.module';
import { SkillCollectionsModule } from 'src/modules/skill-collectiolns/skill-collectiolns.module';
import { providePrismaClientExceptionFilter } from 'nestjs-prisma';
import { AuthModule } from 'src/auth/auth.module';
import { CompaniesModule } from 'src/modules/companies/companies.module';
import { InternshipsModule } from 'src/modules/internships/internships.module';
import { JobPositionsModule } from 'src/modules/job-positions/job-positions.module';
import { LoggingModule } from 'src/logging/logging.module';
import { SkillAssessmentsModule } from 'src/modules/skill-assessments/skill-assessments.module';
import { SeedModule } from 'src/seed/seed.module';

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
    LoggingModule,
    UsersModule,
    CurriculumsModule,
    BranchesModule,
    LessonModule,
    PlosModule,
    ClosModule,
    SkillsModule,
    FacultiesModule,
    AuthModule,
    StudentsModule,
    CoursesModule,
    SubjectModule,
    InstructorsModule,
    SkillCollectionsModule,
    SkillAssessmentsModule,
    CompaniesModule,
    InternshipsModule,
    JobPositionsModule,
    SkillAssessmentsModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    providePrismaClientExceptionFilter({
      // Prisma Error Code: HTTP Status Response
      P2000: HttpStatus.BAD_REQUEST,
      P2002: HttpStatus.CONFLICT,
      P2025: HttpStatus.NOT_FOUND,
    }),
  ],
})
export class AppModule {}
