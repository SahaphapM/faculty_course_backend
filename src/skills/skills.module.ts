import { Module } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { SkillsController } from './skills.controller';
import { Skill } from './entities/skill.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TechSkill } from 'src/tech-skills/entities/tech-skill.entity';
import { TechSkillsService } from 'src/tech-skills/tech-skills.service';

@Module({
  imports: [TypeOrmModule.forFeature([Skill, TechSkill])],
  controllers: [SkillsController],
  providers: [SkillsService, TechSkillsService],
  exports: [SkillsService],
})
export class SkillsModule {}
