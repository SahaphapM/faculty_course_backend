import { Module } from '@nestjs/common';
import { CurriculumsService } from './curriculums.service';
import { CurriculumsController } from './curriculums.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Curriculum } from '../../entities/curriculum.entity';
import { Skill } from 'src/entities/skill.entity';
import { Branch } from 'src/entities/branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Curriculum, Skill, Branch])],
  controllers: [CurriculumsController],
  providers: [CurriculumsService],
  exports: [CurriculumsService],
})
export class CurriculumsModule {}
