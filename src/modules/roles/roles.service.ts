import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from '../../dto/role/create-role.dto';
import { UpdateRoleDto } from '../../dto/role/update-role.dto';
import { Repository } from 'typeorm';
import { Role } from '../../entities/role.entity';
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

  async findOne(id: number): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { id },
      // relations: ['users'],
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
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

  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    try {
      await this.rolesRepository.remove(role);
    } catch (error) {
      throw new BadRequestException('Failed to remove role: ' + error.message);
    }
  }
}
