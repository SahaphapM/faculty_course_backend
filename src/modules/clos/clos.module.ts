import { Module } from '@nestjs/common';
import { ClosService } from './clos.service';
import { ClosController } from './clos.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClosController],
  providers: [ClosService],
  exports: [ClosService],
})
export class ClosModule {}
