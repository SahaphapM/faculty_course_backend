import { Module } from '@nestjs/common';
import { CurriculumsService } from './curriculums.service';
import { CurriculumsController } from './curriculums.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Curriculum } from './entities/curriculum.entity';
import { SubjectsModule } from 'src/subjects/subjects.module';
import { UsersModule } from 'src/users/users.module';
import { PlosModule } from 'src/plos/plos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Curriculum]),
    SubjectsModule,
    UsersModule,
    PlosModule,
  ],
  controllers: [CurriculumsController],
  providers: [CurriculumsService],
  exports: [CurriculumsService],
})
export class CurriculumsModule {}
