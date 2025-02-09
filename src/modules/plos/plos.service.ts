import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plo } from 'src/entities/plo.entity';
import { CreatePloDto } from '../../dto/plo/create-plo.dto';
import { UpdatePloDto } from '../../dto/plo/update-plo.dto';
import { CurriculumsService } from '../curriculums/curriculums.service';

@Injectable()
export class PlosService {
  constructor(
    @InjectRepository(Plo)
    private readonly ploRepository: Repository<Plo>,

    private readonly curriculumService: CurriculumsService,
  ) {}

  async create(createPloDto: CreatePloDto): Promise<Plo> {
    const curriculum = await this.curriculumService.findOne(
      createPloDto.curriculumId,
    );
    if (!curriculum) {
      throw new NotFoundException(
        `Curriculum with ID ${createPloDto.curriculumId} not found`,
      );
    }

    try {
      const plo = this.ploRepository.create({
        curriculum: curriculum,
        ...createPloDto,
      });
      const savedPlo = await this.ploRepository.save(plo);
      console.log(savedPlo);
      return savedPlo;
    } catch (error) {
      throw new Error(`Failed to create branch ${error.message}`);
    }
  }

  async findAll(): Promise<Plo[]> {
    return this.ploRepository.find({ relations: ['curriculum', 'clos'] });
  }

  async findOne(id: number): Promise<Plo> {
    const plo = await this.ploRepository.findOne({
      where: { id },
      relations: ['curriculum', 'clos'],
    });
    if (!plo) {
      throw new NotFoundException(`PLO with ID ${id} not found`);
    }
    return plo;
  }

  async update(id: number, updatePloDto: UpdatePloDto): Promise<Plo> {
    const plo = await this.findOne(id);
    Object.assign(plo, updatePloDto);
    return this.ploRepository.save(plo);
  }

  async remove(id: number): Promise<void> {
    const plo = await this.findOne(id);
    await this.ploRepository.remove(plo);
  }
}
