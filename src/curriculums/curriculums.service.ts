import { Injectable } from '@nestjs/common';
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

  create(createCurriculumDto: CreateCurriculumDto) {
    return this.curriculumsRepository.save(createCurriculumDto);
  }

  findAll() {
    return this.curriculumsRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} curriculum`;
  }

  update(id: number, updateCurriculumDto: UpdateCurriculumDto) {
    return `This action updates a #${id} curriculum`;
  }

  remove(id: number) {
    return `This action removes a #${id} curriculum`;
  }
}
