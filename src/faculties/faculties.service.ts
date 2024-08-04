import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { Faculty } from './entities/faculty.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FacultiesService {
  constructor(
    @InjectRepository(Faculty)
    private facultiesRepository: Repository<Faculty>,
  ) {}
  async create(createFacultyDto: CreateFacultyDto): Promise<Faculty> {
    try {
      const faculty = this.facultiesRepository.create(createFacultyDto);
      return await this.facultiesRepository.save(faculty);
    } catch (error) {
      // Handle specific error types here
      throw new Error('Failed to create faculty');
    }
  }

  async findAll(): Promise<Faculty[]> {
    try {
      return await this.facultiesRepository.find({
        relations: { branches: true, departments: true },
      });
    } catch (error) {
      // Handle specific error types here
      throw new Error('Failed to fetch faculties');
    }
  }

  async findAllBranchId(): Promise<any[]> {
    try {
      const faculties = await this.facultiesRepository
        .createQueryBuilder('faculty')
        .leftJoinAndSelect('faculty.branches', 'branch')
        .select([
          'faculty.id', // Select faculty ID
          'faculty.name', // Select faculty name
          'branch.id', // Select branch ID
          'branch.name', // Select branch name
        ])
        .getMany();

      // Transform the result to include an array of branches for each faculty
      return faculties.map((faculty) => ({
        id: faculty.id,
        name: faculty.name,
        branches: faculty.branches.map((branch) => ({
          id: branch.id,
          name: branch.name,
        })),
      }));
    } catch (error) {
      throw new Error('Failed to fetch faculties');
    }
  }

  async findOne(id: string): Promise<Faculty> {
    try {
      const faculty = await this.facultiesRepository.findOne({
        where: { id },
        relations: { branches: true, departments: true },
      });
      if (!faculty) {
        throw new NotFoundException('Faculty not found');
      }
      return faculty;
    } catch (error) {
      // Handle specific error types here
      throw new Error('Failed to fetch faculty');
    }
  }

  async update(
    id: string,
    updateFacultyDto: UpdateFacultyDto,
  ): Promise<Faculty> {
    try {
      const existingFaculty = await this.facultiesRepository.findOne({
        where: { id },
      });
      if (!existingFaculty) {
        throw new NotFoundException('Faculty not found');
      }
      Object.assign(existingFaculty, updateFacultyDto);
      await this.facultiesRepository.save(existingFaculty);
      return await this.facultiesRepository.findOne({
        where: { id },
        relations: { branches: true, departments: true },
      });
    } catch (error) {
      // Handle specific error types here
      throw new Error('Failed to update faculty');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.facultiesRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException('Faculty not found');
      }
    } catch (error) {
      // Handle specific error types here
      throw new Error('Failed to remove faculty');
    }
  }
}
