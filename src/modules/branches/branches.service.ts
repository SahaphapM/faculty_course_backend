import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateBranchDto } from '../../dto/branch/create-branch.dto';
import { UpdateBranchDto } from '../../dto/branch/update-branch.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { Branch } from '../../entities/branch.entity';
import { PaginationDto } from 'src/dto/pagination.dto';
import { Faculty } from 'src/entities/faculty.entity';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private braRepo: Repository<Branch>,
    @InjectRepository(Faculty)
    private facRepo: Repository<Faculty>,
  ) { }

  async create(createBranchDto: CreateBranchDto): Promise<Branch> {
    try {
      const { facultyId, ...rest } = createBranchDto
      const existBranch = await this.braRepo.findOne({
        where: { name: createBranchDto.name },
      });
      if (existBranch) {
        throw new Error(
          `Branch with name ${createBranchDto.name} already exists`,
        );
      }
      const existFaculty = await this.facRepo.findOne({
        where: { id: facultyId }
      })
      if (existFaculty) {
        const branch = this.braRepo.create({
          ...rest,
          faculty: existFaculty
        })
        return await this.braRepo.save(branch);
      } else {
        throw new Error(
          `Faculty with ID ${facultyId} does not exist`,
        );
      }
    } catch (error) {
      throw new Error(`Failed to create branch ${error.message}`);
    }
  }

  async findAll(pag?: PaginationDto) {
    const defaultLimit = 10;
    const defaultPage = 1;

    const options: FindManyOptions<Branch> = {
      relationLoadStrategy: 'query',
      select: {
        id: true,
        name: true,
        engName: true,
        abbrev: true
      },
    };
    try {
      if (pag) {
        const { search, limit, page, order } = pag;

        options.take = limit || defaultLimit;
        options.skip = ((page || defaultPage) - 1) * (limit || defaultLimit);
        options.order = { id: order || 'ASC' };

        if (search) {
          options.where = [
            { name: Like(`%${search}%`) }
          ];
        }
        return await this.braRepo.findAndCount(options);
      } else {
        return await this.braRepo.find(options);
      }
    } catch (error) {
      // Log the error for debugging
      console.error('Error fetching branches:', error);
      throw new InternalServerErrorException('Failed to fetch branches');
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
    try {
      const branches = await this.braRepo
        .createQueryBuilder('branch')
        .select(['branch.id', 'branch.name', 'branch.engName'])
        .where('branch.facultyId = :facultyId', { facultyId })
        .getMany();
      return branches;
    } catch (error) {
      throw new Error('Failed to fetch branches');
    }
  }
}
