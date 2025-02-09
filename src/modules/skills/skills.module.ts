import { Module } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { SkillsController } from './skills.controller';
import { Skill } from '../../entities/skill.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Curriculum } from 'src/entities/curriculum.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Skill, Curriculum])],
  controllers: [SkillsController],
  providers: [SkillsService],
  exports: [SkillsService],
})
export class SkillsModule {}
