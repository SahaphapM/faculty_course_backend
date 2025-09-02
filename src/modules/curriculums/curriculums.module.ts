import { Module } from '@nestjs/common';
import { CurriculumsService } from './curriculums.service';
import { CurriculumsController } from './curriculums.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CoordinatorCurriculumsService } from './coordinator-curriculums.service';
import { LevelDescriptionsService } from './level-descriptions.service';
import { LevelDescriptionsController } from './level-descriptions.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CurriculumsController, LevelDescriptionsController],
  providers: [CurriculumsService, CoordinatorCurriculumsService, LevelDescriptionsService],
  exports: [CurriculumsService],
})
export class CurriculumsModule {}
