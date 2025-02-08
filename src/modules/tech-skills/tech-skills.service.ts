import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTechSkillDto } from './dto/create-tech-skill.dto';
import { UpdateTechSkillDto } from './dto/update-tech-skill.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { TechSkill } from '../../entities/tech-skill.entity';

@Injectable()
export class TechSkillsService {
  constructor(
    @InjectRepository(TechSkill)
    private repo: Repository<TechSkill>,
  ) {}

  async create(dto: CreateTechSkillDto) {
    const exist = await this.repo.findOneBy({ slug: dto.slug });
    if (exist) {
      throw new BadRequestException('this tech skill already exist!');
    }
    return this.repo.save(dto);
  }

  async findAll() {
    return await this.repo.find();
  }

  async findOne(slug: string) {
    return await this.repo.findOneBy({ slug });
  }

  async update(slug: string, dto: UpdateTechSkillDto) {
    const exist = this.repo.findOneBy({ slug: dto.slug });
    if (!exist) {
      return new BadRequestException('not found the tech skill!');
    }
    await this.repo.update({ slug }, dto);
    return `This action updates a #${slug} tech skill`;
  }

  async remove(slug: string) {
    await this.repo.delete({ slug });
    return `This action removes a #${slug} tech skill`;
  }
}
