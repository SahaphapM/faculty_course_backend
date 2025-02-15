import { Module } from '@nestjs/common';
import { SubjectService } from './subjects.service';
import { SubjectController } from './subjects.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SubjectController],
  providers: [SubjectService],
  exports: [SubjectService],
})
export class SubjectModule {}
