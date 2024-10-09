import { Module } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from '../../entities/subject.entity';
import { SkillDetail } from 'src/entities/skillDetail.entity';
import { SkillsModule } from 'src/modules/skills/skills.module';
import { Curriculum } from '../../entities/curriculum.entity';
import { ClosModule } from '../clos/clos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subject, Curriculum, SkillDetail]),
    ClosModule,
    SkillsModule,
  ],
  controllers: [SubjectsController],
  providers: [SubjectsService],
  exports: [SubjectsService],
})
export class SubjectsModule {}
