import { Module } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from '../../entities/subject.entity';
import { SkillDetail } from 'src/entities/skillDetail.entity';
import { Curriculum } from '../../entities/curriculum.entity';
import { ClosModule } from '../clos/clos.module';
import { Skill } from 'src/entities/skill.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subject, Curriculum, SkillDetail, Skill]),
    ClosModule,
  ],
  controllers: [SubjectsController],
  providers: [SubjectsService],
  exports: [SubjectsService],
})
export class SubjectsModule {}
