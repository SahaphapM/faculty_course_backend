import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBranchDto } from '../../dto/branch/create-branch.dto';
import { UpdateBranchDto } from '../../dto/branch/update-branch.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '../../entities/branch.entity';

@Injectable()
export class BranchsService {
  constructor(
    @InjectRepository(Branch)
    private branchsRepository: Repository<Branch>,
  ) {}

  async create(createBranchDto: CreateBranchDto): Promise<Branch> {
    try {
      const branch = this.branchsRepository.create(createBranchDto);
      return await this.branchsRepository.save(branch);
    } catch (error) {
      throw new Error(`Failed to create branch ${error.message}`);
    }
  }

  async findAll(): Promise<Branch[]> {
    try {
      return await this.branchsRepository.find({
        relations: { curriculums: true, department: true, faculty: true },
      });
    } catch (error) {
      throw new Error('Failed to fetch branches');
    }
  }

  async findOne(id: string): Promise<Branch> {
    try {
      const branch = await this.branchsRepository.findOne({
        where: { id },
        relations: { curriculums: true, department: true, faculty: true },
      });
      if (!branch) {
        throw new NotFoundException(`Branch with ID ${id} not found`);
      }
      return branch;
    } catch (error) {
      throw new Error('Failed to fetch branch');
    }
  }

  async update(id: string, updateBranchDto: UpdateBranchDto): Promise<Branch> {
    try {
      const branch = await this.findOne(id);
      Object.assign(branch, updateBranchDto);
      await this.branchsRepository.save(branch);
      return this.branchsRepository.findOne({
        where: { id },
        relations: { faculty: true, curriculums: true, department: true },
      });
    } catch (error) {
      throw new Error('Failed to update branch');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const branch = await this.findOne(id);
      await this.branchsRepository.remove(branch);
    } catch (error) {
      throw new Error('Failed to remove branch');
    }
  }
}
