import { Module } from '@nestjs/common';
import { PloService } from './plos.service';
import { PlosController } from './plos.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlosController],
  providers: [PloService],
  exports: [PloService],
})
export class PlosModule {}
