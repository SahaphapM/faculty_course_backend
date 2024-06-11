import { Injectable } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';

@Injectable()
export class BranchsService {
  constructor(
    @InjectRepository(Branch)
    private branchsRepository: Repository<Branch>,
  ) {}
  create(createBranchDto: CreateBranchDto) {
    return this.branchsRepository.save(createBranchDto);
  }

  findAll() {
    return this.branchsRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} branch`;
  }

  update(id: number, updateBranchDto: UpdateBranchDto) {
    return `This action updates a #${id} branch`;
  }

  remove(id: number) {
    return `This action removes a #${id} branch`;
  }
}
