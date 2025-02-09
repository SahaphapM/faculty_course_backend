import { Module } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { SkillsController } from './skills.controller';
import { Skill } from '../../entities/skill.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TechSkill } from 'src/entities/tech-skill.entity';
import { TechSkillsService } from 'src/modules/tech-skills/tech-skills.service';
import { Curriculum } from 'src/entities/curriculum.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Skill, TechSkill, Curriculum])],
  controllers: [SkillsController],
  providers: [SkillsService, TechSkillsService],
  exports: [SkillsService],
})
export class SkillsModule {}
