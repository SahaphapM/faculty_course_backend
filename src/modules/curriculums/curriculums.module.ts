import { Module } from '@nestjs/common';
import { CurriculumsService } from './curriculums.service';
import { CurriculumsController } from './curriculums.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CoordinatorCurriculumsService } from './coordinator-curriculums.service';

@Module({
  imports: [PrismaModule],
  controllers: [CurriculumsController],
  providers: [CurriculumsService, CoordinatorCurriculumsService],
  exports: [CurriculumsService],
})
export class CurriculumsModule {}
