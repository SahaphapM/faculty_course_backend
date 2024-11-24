import { Module } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { BranchesController } from './branches.controller';
import { Branch } from '../../entities/branch.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faculty } from 'src/entities/faculty.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Branch, Faculty])],
  controllers: [BranchesController],
  providers: [BranchesService],
  exports: [BranchesService],
})
export class BranchesModule { }
