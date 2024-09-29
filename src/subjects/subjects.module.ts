import { Module } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from './entities/subject.entity';
import { ClosModule } from 'src/clos/clos.module';
import { Curriculum } from 'src/curriculums/entities/curriculum.entity';
import { SkillDetail } from 'src/skills/entities/skillDetail.entity';
import { SkillsModule } from 'src/skills/skills.module';

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
