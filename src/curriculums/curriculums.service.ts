import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCurriculumDto } from './dto/create-curriculum.dto';
import { UpdateCurriculumDto } from './dto/update-curriculum.dto';
import { Curriculum } from './entities/curriculum.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CurriculumsService {
  constructor(
    @InjectRepository(Curriculum)
    private curriculumsRepository: Repository<Curriculum>,
  ) {}

  async create(createCurriculumDto: CreateCurriculumDto): Promise<Curriculum> {
    const curriculum = this.curriculumsRepository.create(createCurriculumDto);
    try {
      await this.curriculumsRepository.save(curriculum);
      const id = curriculum.id;
      return this.curriculumsRepository.findOne({
        where: { id },
        relations: { coordinators: true },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to create Curriculum ',
        error.message,
      );
    }
  }

  async findAll(): Promise<Curriculum[]> {
    return await this.curriculumsRepository.find({
      relations: {
        coordinators: true,
        plos: true,
        subjects: true,
        branch: true,
      },
    });
  }

  async findOne(id: string): Promise<Curriculum> {
    const curriculum = await this.curriculumsRepository.findOne({
      where: { id },
      relations: {
        coordinators: true,
        plos: true,
        subjects: true,
        branch: true,
      },
    });
    if (!curriculum) {
      throw new NotFoundException(`Curriculum with ID '${id}' not found`);
    }
    return curriculum;
  }

  async update(
    id: string,
    updateCurriculumDto: UpdateCurriculumDto,
  ): Promise<Curriculum> {
    const curriculum = await this.findOne(id);

    if (!curriculum) {
      throw new NotFoundException(`Curriculum with ID ${id} not found`);
    }

    this.curriculumsRepository.merge(curriculum, updateCurriculumDto); // directly merge is not to delete the first data.
    curriculum.coordinators = updateCurriculumDto.coordinators;
    curriculum.plos = updateCurriculumDto.plos;
    curriculum.subjects = updateCurriculumDto.subjects;
    // Object.assign(curriculum, updateCurriculumDto); // directly create new delete the first data to new value.

    try {
      await this.curriculumsRepository.save(curriculum);
      return this.curriculumsRepository.findOne({
        where: { id },
        relations: { coordinators: true },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to update Curriculum',
        error.message,
      );
    }
  }

  async remove(id: string): Promise<void> {
    const curriculum = await this.findOne(id);
    try {
      await this.curriculumsRepository.remove(curriculum);
    } catch (error) {
      throw new BadRequestException('Failed to remove user');
    }
  }
}
