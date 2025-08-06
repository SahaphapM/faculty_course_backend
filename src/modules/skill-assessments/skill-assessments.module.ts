import { Module } from '@nestjs/common';
import { SkillAssessmentsService } from './skill-assessments.service';
import { SkillAssessmentsController } from './skill-assessments.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SkillAssessmentsController],
  providers: [SkillAssessmentsService],
})
export class SkillAssessmentsModule {}
