import { Module } from '@nestjs/common';
import { ClosService } from './clos.service';
import { ClosController } from './clos.controller';
import { Clo } from '../../entities/clo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plo } from 'src/entities/plo.entity';
import { Skill } from 'src/entities/skill.entity';
import { CourseSpec } from 'src/entities/course-spec.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Clo, CourseSpec, Plo, Skill])],
  controllers: [ClosController],
  providers: [ClosService],
  exports: [ClosService],
})
export class ClosModule {}
