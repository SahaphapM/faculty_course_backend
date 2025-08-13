import { Module } from '@nestjs/common';
import { SkillAssessmentsService } from './skill-assessments.service';
import { SkillAssessmentsController } from './skill-assessments.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SkillCollectionsModule } from '../skill-collectiolns/skill-collectiolns.module';
@Module({
  imports: [PrismaModule, SkillCollectionsModule],
  controllers: [SkillAssessmentsController],
  providers: [SkillAssessmentsService],
  exports: [SkillAssessmentsService],
})
export class SkillAssessmentsModule {}


