import { Module } from '@nestjs/common';
import { CurriculumsService } from './curriculums.service';
import { CurriculumsController } from './curriculums.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Curriculum } from '../../entities/curriculum.entity';
import { BranchesModule } from '../branches/branches.module';
import { Skill } from 'src/entities/skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Curriculum, Skill]), BranchesModule],
  controllers: [CurriculumsController],
  providers: [CurriculumsService],
  exports: [CurriculumsService],
})
export class CurriculumsModule {}
