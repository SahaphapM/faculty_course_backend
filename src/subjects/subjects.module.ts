import { Module } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from './entities/subject.entity';
import { Curriculum } from 'src/curriculums/entities/curriculum.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subject, Curriculum])],
  controllers: [SubjectsController],
  providers: [SubjectsService],
})
export class SubjectsModule {}
