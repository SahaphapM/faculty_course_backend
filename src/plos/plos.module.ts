import { Module } from '@nestjs/common';
import { PlosService } from './plos.service';
import { PlosController } from './plos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plo } from './entities/plo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plo])],
  controllers: [PlosController],
  providers: [PlosService],
})
export class PlosModule {}
