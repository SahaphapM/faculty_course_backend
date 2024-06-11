import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CurriculumsModule } from './curriculums/curriculums.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Curriculum } from './curriculums/entities/curriculum.entity';
import { DataSource } from 'typeorm';
import { BranchsModule } from './branchs/branchs.module';
import { User } from './users/entities/user.entity';
import { Branch } from './branchs/entities/branch.entity';
import { RolesModule } from './roles/roles.module';
import { Role } from './roles/entities/role.entity';
import { SubjectsModule } from './subjects/subjects.module';
import { PlosModule } from './plos/plos.module';
import { ClosModule } from './clos/clos.module';
import { Plo } from './plos/entities/plo.entity';
import { Clo } from './clos/entities/clo.entity';
import { Subject } from './subjects/entities/subject.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'mybuu.sqlite',
      logging: false,
      entities: [Curriculum, User, Branch, Role, Plo, Clo, Subject],
      synchronize: true,
    }),
    UsersModule,
    CurriculumsModule,
    BranchsModule,
    RolesModule,
    SubjectsModule,
    PlosModule,
    ClosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
