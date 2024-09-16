import { Module } from '@nestjs/common';
import { TechSkillsService } from './tech-skills.service';
import { TechSkillsController } from './tech-skills.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TechSkill } from './entities/tech-skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TechSkill])],
  controllers: [TechSkillsController],
  providers: [TechSkillsService],
})
export class TechSkillsModule {}
