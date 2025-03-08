import { Module } from '@nestjs/common';
import { SkillCollectiolnsService } from './skill-collectiolns.service';
import { SkillCollectiolnsController } from './skill-collectiolns.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StudentsModule } from '../students/students.module';
import { ClosModule } from '../clos/clos.module';

@Module({
  imports: [PrismaModule, StudentsModule, ClosModule],
  controllers: [SkillCollectiolnsController],
  providers: [SkillCollectiolnsService],
})
export class SkillCollectiolnsModule {}
