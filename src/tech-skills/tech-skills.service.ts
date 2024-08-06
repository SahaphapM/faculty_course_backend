import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTechSkillDto } from './dto/create-tech-skill.dto';
import { UpdateTechSkillDto } from './dto/update-tech-skill.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { TechSkill } from './entities/tech-skill.entity';

@Injectable()
export class TechSkillsService {
  constructor(
    @InjectRepository(TechSkill)
    private repo: Repository<TechSkill>,
  ) {}

  async create(dto: CreateTechSkillDto) {
    const existId = await this.repo.findOneBy({ id: dto.id });
    if (existId) {
      throw new BadRequestException('this id already exist!');
    }
    const newObj = this.repo.create(dto);
    await this.repo.save(newObj);
    return 'Create Success';
  }

  async findAll() {
    return await this.repo.find();
  }

  async findOne(id: string) {
    return await this.repo.findOneBy({ id });
  }

  async update(id: string, dto: UpdateTechSkillDto) {
    const existId = this.repo.findOneBy({ id: dto.id });
    if (!existId) {
      return new BadRequestException('not found the tech skill!');
    }
    await this.repo.update({ id }, dto);
    return `This action updates a #${id} techSkill`;
  }

  async remove(id: string) {
    await this.repo.delete({ id });
    return `This action removes a #${id} techSkill`;
  }
}
