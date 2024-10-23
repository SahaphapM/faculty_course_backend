import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBranchDto } from '../../dto/branch/create-branch.dto';
import { UpdateBranchDto } from '../../dto/branch/update-branch.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '../../entities/branch.entity';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private braRepo: Repository<Branch>,
  ) {}

  async create(createBranchDto: CreateBranchDto): Promise<Branch> {
    try {
      const existingBranch = await this.braRepo.findOne({
        where: { name: createBranchDto.name },
      });
      if (existingBranch) {
        throw new Error(
          `Branch with name ${createBranchDto.name} already exists`,
        );
      }
      const branch = this.braRepo.create(createBranchDto);
      return await this.braRepo.save(branch);
    } catch (error) {
      throw new Error(`Failed to create branch ${error.message}`);
    }
  }

  async findAll(): Promise<Branch[]> {
    try {
      return await this.braRepo.find({
        relations: { curriculums: true, faculty: true },
      });
    } catch (error) {
      throw new Error('Failed to fetch branches');
    }
  }

  async findOne(id: string): Promise<Branch> {
    try {
      const branch = await this.braRepo.findOne({
        where: { id },
        relations: { curriculums: true, faculty: true },
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
      await this.braRepo.save(branch);
      return this.braRepo.findOne({
        where: { id },
        relations: { faculty: true, curriculums: true },
      });
    } catch (error) {
      throw new Error('Failed to update branch');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const branch = await this.findOne(id);
      await this.braRepo.remove(branch);
    } catch (error) {
      throw new Error('Failed to remove branch');
    }
  }

  async filters(facultyId: string): Promise<Branch[]> {
    console.log(facultyId);
    try {
      const branches = await this.braRepo
        .createQueryBuilder('branch')
        .select(['branch.id', 'branch.name'])
        .where('branch.facultyId = :facultyId', { facultyId })
        .getMany();
      return branches;
    } catch (error) {
      throw new Error('Failed to fetch branches');
    }
  }
}
