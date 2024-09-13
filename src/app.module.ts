import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CurriculumsModule } from './curriculums/curriculums.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchsModule } from './branchs/branchs.module';
import { RolesModule } from './roles/roles.module';
import { SubjectsModule } from './subjects/subjects.module';
import { PlosModule } from './plos/plos.module';
import { ClosModule } from './clos/clos.module';
import { SkillsModule } from './skills/skills.module';
import { DepartmentsModule } from './departments/departments.module';
import { FacultiesModule } from './faculties/faculties.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TechSkillsModule } from './tech-skills/tech-skills.module';

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
    //   logging: false,
    //   autoLoadEntities: true,
    //   synchronize: true,
    // }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mariadb',
        host: config.getOrThrow('DB_HOST'),
        port: 3306,
        username: config.getOrThrow('DB_USERNAME'),
        password: config.getOrThrow('DB_PASSWORD'),
        database: config.getOrThrow('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
        logging: true,
      }),
      inject: [ConfigService],
    }),
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
    TechSkillsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
