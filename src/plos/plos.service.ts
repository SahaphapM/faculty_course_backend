import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePloDto } from './dto/create-plo.dto';
import { UpdatePloDto } from './dto/update-plo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plo } from './entities/plo.entity';

@Injectable()
export class PlosService {
  constructor(
    @InjectRepository(Plo)
    private plosRepository: Repository<Plo>,
  ) {}

  async create(createPloDto: CreatePloDto): Promise<Plo> {
    const plo = this.plosRepository.create(createPloDto);
    try {
      return await this.plosRepository.save(plo);
    } catch (error) {
      throw new BadRequestException('Failed to create PLO', error.message);
    }
  }

  async findAll(): Promise<Plo[]> {
    return await this.plosRepository.find({
      relations: ['curriculum', 'clos'],
    });
  }

  async findOne(id: string): Promise<Plo> {
    const plo = await this.plosRepository.findOne({
      where: { id },
      relations: ['curriculum', 'clos'],
    });
    if (!plo) {
      throw new NotFoundException(`PLO with ID ${id} not found`);
    }
    return plo;
  }

  async update(id: string, updatePloDto: UpdatePloDto): Promise<Plo> {
    const plo = await this.plosRepository.preload({
      id,
      ...updatePloDto,
    });

    if (!plo) {
      throw new NotFoundException(`PLO with ID ${id} not found`);
    }

    try {
      await this.plosRepository.save(plo);
      return this.plosRepository.findOne({
        where: { id },
        relations: { clos: true, curriculum: true },
      });
    } catch (error) {
      throw new BadRequestException(`Failed to update PLO`);
    }
  }

  async remove(id: string): Promise<void> {
    const plo = await this.findOne(id);
    if (!plo) {
      throw new NotFoundException(`PLO with ID ${id} not found`);
    }

    try {
      await this.plosRepository.remove(plo);
    } catch (error) {
      throw new BadRequestException(`Failed to remove PLO`);
    }
  }
}
