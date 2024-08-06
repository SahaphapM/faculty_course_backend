import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CurriculumsModule } from './curriculums/curriculums.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BranchsModule } from './branchs/branchs.module';
import { RolesModule } from './roles/roles.module';
import { SubjectsModule } from './subjects/subjects.module';
import { PlosModule } from './plos/plos.module';
import { ClosModule } from './clos/clos.module';
import { SkillsModule } from './skills/skills.module';
import { DepartmentsModule } from './departments/departments.module';
import { FacultiesModule } from './faculties/faculties.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TechSkillsModule } from './tech-skills/tech-skills.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'mybuu.sqlite',
      logging: false,
      // entities: [
      //   Curriculum,
      //   User,
      //   Branch,
      //   Role,
      //   Plo,
      //   Clo,
      //   Subject,
      //   Faculty,
      //   Skill,
      //   Department,
      // ],
      autoLoadEntities: true,
      synchronize: true,
    }),
    // TypeOrmModule.forRoot({
    //   type: 'mysql',
    //   host: 'mysql_db',
    //   port: 3306,
    //   username: 'user123',
    //   password: 'pass123',
    //   database: 'faculty_db',
    //   entities: [
    //     Curriculum,
    //     User,
    //     Branch,
    //     Role,
    //     Plo,
    //     Clo,
    //     Subject,
    //     Faculty,
    //     Skill,
    //     Department,
    //   ],
    //   synchronize: true,
    // }),
    UsersModule,
    CurriculumsModule,
    BranchsModule,
    RolesModule,
    SubjectsModule,
    PlosModule,
    ClosModule,
    SkillsModule,
    DepartmentsModule,
    FacultiesModule,
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // Serve files from 'public' directory
      serveRoot: '/public', // URL path to serve static files
    }),
    TechSkillsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
