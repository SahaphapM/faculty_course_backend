import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from './entities/skill.entity';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private skillsRepository: Repository<Skill>,
  ) {}

  async create(createSkillDto: CreateSkillDto): Promise<Skill> {
    console.log(createSkillDto);

    const skill = this.skillsRepository.create(createSkillDto);
    try {
      return await this.skillsRepository.save(skill);
    } catch (error) {
      throw new BadRequestException('Failed to create skill');
    }
  }

  async findAllByPage(
    paginationDto: PaginationDto,
  ): Promise<{ data: Skill[]; total: number }> {
    const { page, limit, sort, order, search } = paginationDto;

    const options: FindManyOptions<Skill> = {
      take: limit,
      skip: (page - 1) * limit,
      order: sort ? { [sort]: order } : {},
      relations: { subjects: true },
    };

    if (search) {
      options.where = [
        { id: Like(`%${search}%`) },
        { name: Like(`%${search}%`) },
        { description: Like(`%${search}%`) },
        { subjects: Like(`%${search}%`) }, // Corrected for nested relation
      ];
    }

    // console.log('Query options:', options); // Debugging line

    const [result, total] = await this.skillsRepository.findAndCount(options);

    // console.log('Result:', result); // Debugging line
    // console.log('Total:', total); // Debugging line

    return { data: result, total };
  }

  async findAll(): Promise<Skill[]> {
    return await this.skillsRepository.find();
  }

  async findOne(id: string): Promise<Skill> {
    const skill = await this.skillsRepository.findOne({
      where: { id },
      relations: { relatedSkills: true, subjects: true },
    });
    if (!skill) {
      throw new NotFoundException(`Skill with id ${id} not found`);
    }
    return skill;
  }

  async update(id: string, updateSkillDto: UpdateSkillDto): Promise<Skill> {
    await this.findOne(id); // Ensure the skill exists
    const skill = await this.skillsRepository.preload({
      id,
      ...updateSkillDto,
    });

    if (!skill) {
      throw new NotFoundException(`Skill with id ${id} not found`);
    }
    console.log(updateSkillDto);
    console.log(skill);

    try {
      return await this.skillsRepository.save(skill);
    } catch (error) {
      throw new BadRequestException('Failed to update skill');
    }
  }

  async updateSubSkills(
    id: string,
    createSkillsDto: CreateSkillDto[],
  ): Promise<Skill> {
    const skill = await this.findOne(id); // Ensure the skill exists

    const subSkills = [];
    for (let index = 0; index < createSkillsDto.length; index++) {
      const subSkill = await this.findOne(createSkillsDto[index].id);
      subSkills.push(subSkill);
    }

    skill.relatedSkills = subSkills; // update new skill[]

    try {
      return await this.skillsRepository.save(skill);
    } catch (error) {
      throw new BadRequestException('Failed to update skill');
    }
  }

  async removeSubSkills(id: string, subId: string): Promise<void> {
    const skill = await this.findOne(id); // Ensure the skill exists
    skill.relatedSkills = skill.relatedSkills.filter(
      (relatedSkill) => relatedSkill.id !== subId,
    );
    console.log(skill.relatedSkills);

    try {
      await this.skillsRepository.save(skill);
    } catch (error) {
      throw new BadRequestException('Failed to remove subSkill');
    }
  }

  async remove(id: string): Promise<void> {
    const skill = await this.findOne(id); // Ensure the skill exists
    try {
      await this.skillsRepository.remove(skill);
    } catch (error) {
      throw new BadRequestException('Failed to remove skill');
    }
  }
}
