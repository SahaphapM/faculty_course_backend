import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCloDto } from './dto/create-clo.dto';
import { UpdateCloDto } from './dto/update-clo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Clo } from './entities/clo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClosService {
  constructor(
    @InjectRepository(Clo)
    private closRepository: Repository<Clo>,
  ) {}

  async create(createCloDto: CreateCloDto): Promise<Clo> {
    const clo = this.closRepository.create(createCloDto);
    try {
      return await this.closRepository.save(clo);
    } catch (error) {
      throw new BadRequestException('Failed to create CLO');
    }
  }

  async findAll(): Promise<Clo[]> {
    return await this.closRepository.find({
      relations: { subject: true, plo: true },
    });
  }

  async findOne(id: string): Promise<Clo> {
    const clo = await this.closRepository.findOne({
      where: { id },
      relations: { subject: true, plo: true },
    });
    if (!clo) {
      throw new NotFoundException(`CLO with id ${id} not found`);
    }
    return clo;
  }

  async update(id: string, updateCloDto: UpdateCloDto): Promise<Clo> {
    await this.findOne(id); // Ensure the CLO exists
    const clo = await this.closRepository.preload({
      id,
      ...updateCloDto,
    });

    if (!clo) {
      throw new NotFoundException(`CLO with id ${id} not found`);
    }

    try {
      return await this.closRepository.save(clo);
    } catch (error) {
      throw new BadRequestException('Failed to update CLO');
    }
  }

  async remove(id: string): Promise<void> {
    const clo = await this.findOne(id); // Ensure the CLO exists
    try {
      await this.closRepository.remove(clo);
    } catch (error) {
      throw new BadRequestException('Failed to remove CLO');
    }
  }
}
