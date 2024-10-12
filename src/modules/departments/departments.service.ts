import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Department } from '../../entities/department.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDepartmentDto } from 'src/dto/department/create-department.dto';
import { UpdateDepartmentDto } from 'src/dto/department/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    try {
      const newDepartment =
        this.departmentsRepository.create(createDepartmentDto);
      return await this.departmentsRepository.save(newDepartment);
    } catch (error) {
      throw new BadRequestException('Failed to create department');
    }
  }

  async findAll(): Promise<Department[]> {
    return this.departmentsRepository.find();
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentsRepository.findOne({
      where: { id },
    });
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return department;
  }

  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<Department> {
    try {
      const department = await this.departmentsRepository.findOne({
        where: { id },
      });
      if (!department) {
        throw new NotFoundException(`Department with ID ${id} not found`);
      }
      this.departmentsRepository.merge(department, updateDepartmentDto);
      await this.departmentsRepository.save(department);
      return await this.departmentsRepository.findOne({
        where: { id },
        // relations: { branches: true, faculty: true },
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to update department with ID ${id}`,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const department = await this.departmentsRepository.findOne({
        where: { id },
      });
      if (!department) {
        throw new NotFoundException(`Department with ID ${id} not found`);
      }
      await this.departmentsRepository.remove(department);
    } catch (error) {
      throw new BadRequestException(
        `Failed to remove department with ID ${id}`,
      );
    }
  }
}
