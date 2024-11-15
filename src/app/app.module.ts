import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from '../modules/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectsModule } from '../modules/subjects/subjects.module';
import { PlosModule } from '../modules/plos/plos.module';
import { SkillsModule } from '../modules/skills/skills.module';
import { FacultiesModule } from '../modules/faculties/faculties.module';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TechSkillsModule } from '../modules/tech-skills/tech-skills.module';
import { StudentsModule } from '../modules/students/students.module';
import { CurriculumsModule } from 'src/modules/curriculums/curriculums.module';
import { BranchesModule } from 'src/modules/branches/branches.module';
import { ClosModule } from 'src/modules/clos/clos.module';
import { DepartmentsModule } from 'src/modules/departments/departments.module';
import { CoursesModule } from 'src/modules/courses/courses.module';

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
    // TypeOrmModule.forRoot({
    //   type: 'sqlite',
    //   database: 'mybuu.sqlite',
    //   logging: true,
    //   autoLoadEntities: true,
    //   synchronize: true,
    // }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mariadb',
        host: config.getOrThrow('DB_HOST'),
        port: +config.getOrThrow('DB_PORT'),
        username: config.getOrThrow('DB_USERNAME'),
        password: config.getOrThrow('DB_PASSWORD'),
        database: config.getOrThrow('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
        // logging: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    CurriculumsModule,
    BranchesModule,
    SubjectsModule,
    PlosModule,
    ClosModule,
    SkillsModule,
    DepartmentsModule,
    FacultiesModule,
    AuthModule,
    TechSkillsModule,
    StudentsModule,
    CoursesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
