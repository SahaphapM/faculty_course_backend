import { Module } from '@nestjs/common';
import { InternshipService } from './internships.service';
import { InternshipController } from './internships.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [InternshipService],
  controllers: [InternshipController],
  exports: [InternshipService]
})
export class InternshipsModule {}
