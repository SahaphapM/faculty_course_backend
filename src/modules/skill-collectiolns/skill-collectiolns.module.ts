import { Module } from '@nestjs/common';
import { SkillCollectionsService } from './skill-collectiolns.service';
import { SkillCollectionsController } from './skill-collectiolns.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StudentsModule } from '../students/students.module';
import { ClosModule } from '../clos/clos.module';

@Module({
  imports: [PrismaModule, StudentsModule, ClosModule],
  controllers: [SkillCollectionsController],
  providers: [SkillCollectionsService],
})
export class SkillCollectionsModule {}
