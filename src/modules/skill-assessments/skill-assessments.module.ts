import { Module } from '@nestjs/common';
import { SkillAssessmentsService } from './skill-assessments.service';
import { SkillAssessmentsController } from './skill-assessments.controller';

@Module({
  controllers: [SkillAssessmentsController],
  providers: [SkillAssessmentsService],
})
export class SkillAssessmentsModule {}
