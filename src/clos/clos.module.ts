import { Module } from '@nestjs/common';
import { ClosService } from './clos.service';
import { ClosController } from './clos.controller';
import { Clo } from './entities/clo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Clo])],
  controllers: [ClosController],
  providers: [ClosService],
  exports: [ClosService],
})
export class ClosModule {}
