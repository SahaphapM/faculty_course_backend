import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from '../../entities/teacher.entity';
import { Branch } from 'src/entities/branch.entity';
import { Curriculum } from 'src/entities/curriculum.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher, Branch, Curriculum])],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [TeachersService],
})
export class TeachersModule {}
