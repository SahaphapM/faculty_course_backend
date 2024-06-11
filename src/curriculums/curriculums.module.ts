import { Module } from '@nestjs/common';
import { CurriculumsService } from './curriculums.service';
import { CurriculumsController } from './curriculums.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Curriculum } from './entities/curriculum.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Curriculum])],
  controllers: [CurriculumsController],
  providers: [CurriculumsService],
  exports: [CurriculumsService],
})
export class CurriculumsModule {}
