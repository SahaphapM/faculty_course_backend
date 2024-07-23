import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plo } from 'src/plos/entities/plo.entity';
import { CreatePloDto } from './dto/create-plo.dto';
import { UpdatePloDto } from './dto/update-plo.dto';

@Injectable()
export class PlosService {
  constructor(
    @InjectRepository(Plo)
    private readonly ploRepository: Repository<Plo>,
  ) {}

  async create(createPloDto: CreatePloDto): Promise<Plo> {
    try {
      const plo = this.ploRepository.create(createPloDto);
      return this.ploRepository.save(plo);
    } catch (error) {
      throw new Error(`Failed to create branch ${error.message}`);
    }
  }

  async findAll(): Promise<Plo[]> {
    return this.ploRepository.find({ relations: ['curriculum', 'clos'] });
  }

  async findOne(id: string): Promise<Plo> {
    const plo = await this.ploRepository.findOne({
      where: { id },
      relations: ['curriculum', 'clos'],
    });
    if (!plo) {
      throw new NotFoundException(`PLO with ID ${id} not found`);
    }
    return plo;
  }

  async update(id: string, updatePloDto: UpdatePloDto): Promise<Plo> {
    const plo = await this.findOne(id);
    Object.assign(plo, updatePloDto);
    return this.ploRepository.save(plo);
  }

  async remove(id: string): Promise<void> {
    const plo = await this.findOne(id);
    await this.ploRepository.remove(plo);
  }
}
