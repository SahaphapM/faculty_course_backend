import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.rolesRepository.create(createRoleDto);
    try {
      return await this.rolesRepository.save(role);
    } catch (error) {
      throw new BadRequestException('Failed to create role');
    }
  }

  async findAll(): Promise<Role[]> {
    return await this.rolesRepository.find();
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { id },
      // relations: ['users'],
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.rolesRepository.preload({
      id,
      ...updateRoleDto,
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    try {
      return await this.rolesRepository.save(role);
    } catch (error) {
      throw new BadRequestException('Failed to update role');
    }
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    console.log(role);
    try {
      await this.rolesRepository.delete(role);
    } catch (error) {
      throw new BadRequestException('Failed to remove role: ' + error.message);
    }
  }
}
