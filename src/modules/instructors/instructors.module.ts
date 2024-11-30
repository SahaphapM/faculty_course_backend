import { Module } from '@nestjs/common';
import { InstructorsService } from './instructors.service';
import { InstructorsController } from './instructors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Instructor } from '../../entities/instructor.entity';
import { Branch } from 'src/entities/branch.entity';
import { Curriculum } from 'src/entities/curriculum.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Instructor, Branch, Curriculum])],
  controllers: [InstructorsController],
  providers: [InstructorsService],
  exports: [InstructorsService],
})
export class InstructorsModule { }
