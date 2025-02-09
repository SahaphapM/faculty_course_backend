import { Module } from '@nestjs/common';
import { PlosService } from './plos.service';
import { PlosController } from './plos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plo } from '../../entities/plo.entity';
import { CurriculumsModule } from '../curriculums/curriculums.module';

@Module({
  imports: [TypeOrmModule.forFeature([Plo]), CurriculumsModule],
  controllers: [PlosController],
  providers: [PlosService],
  exports: [PlosService],
})
export class PlosModule {}
