import { Module } from '@nestjs/common';
import { CurriculumsService } from './curriculums.service';
import { CurriculumsController } from './curriculums.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Curriculum } from '../../entities/curriculum.entity';
import { SubjectsModule } from 'src/modules/subjects/subjects.module';
import { PlosModule } from 'src/modules/plos/plos.module';
import { TeachersModule } from 'src/modules/teachers/teachers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Curriculum]),
    SubjectsModule,
    TeachersModule,
    PlosModule,
  ],
  controllers: [CurriculumsController],
  providers: [CurriculumsService],
  exports: [CurriculumsService],
})
export class CurriculumsModule {}
