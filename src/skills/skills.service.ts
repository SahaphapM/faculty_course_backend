import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from './entities/skill.entity';
import { FindManyOptions, Like, TreeRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from './dto/pagination.dto';
import { TechSkill } from 'src/tech-skills/entities/tech-skill.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private skillsRepository: TreeRepository<Skill>,
  ) {}

  async create(createSkillDto: CreateSkillDto): Promise<Skill> {
    try {
      return await this.skillsRepository.save(createSkillDto);
    } catch (error) {
      throw new BadRequestException(
        'Failed to create skill',
        createSkillDto.name,
      );
    }
  }

  async createChilds(
    parentId: string,
    createSkillDtos: CreateSkillDto[],
  ): Promise<Skill> {
    const parentSkill = await this.findOne(parentId);
    for (let index = 0; index < createSkillDtos.length; index++) {
      if (parentSkill) {
        parentSkill.children.push(
          await this.skillsRepository.save(createSkillDtos[index]),
        );
      }
    }
    try {
      return await this.skillsRepository.save(parentSkill);
    } catch (error) {
      throw new BadRequestException('Failed to create child skills');
    }
  }

  async createTechSkill(id: string, TechSkill: TechSkill[]): Promise<Skill> {
    const skill = await this.findOne(id);
    for (let index = 0; index < TechSkill.length; index++) {
      skill.techSkills.push(TechSkill[index]);
    }

    try {
      return await this.skillsRepository.save(skill);
    } catch (error) {
      throw new BadRequestException('Failed to create techSkills');
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
    return await this.skillsRepository.find({
      relations: {
        parent: true,
        children: true,
        subjects: true,
        techSkills: true,
      },
    });
  }

  async findOne(id: string): Promise<Skill> {
    const skill = await this.skillsRepository.findOne({
      where: { id },
      relations: {
        parent: true,
        children: true,
        subjects: true,
        techSkills: true,
      },
    });
    if (!skill) {
      throw new NotFoundException(`Skill with id ${id} not found`);
    }
    return skill;
  }

  async findTree(): Promise<Skill[]> {
    return await this.skillsRepository.findTrees();
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

    try {
      return await this.skillsRepository.save(skill);
    } catch (error) {
      throw new BadRequestException('Failed to update skill');
    }
  }

  // async updateSubSkills(id: string, subSkillIds: string[]): Promise<Skill> {
  //   const skill = await this.findOne(id); // Ensure the skill exists

  //   const subSkills = [];
  //   for (let index = 0; index < subSkillIds.length; index++) {
  //     const subSkill = await this.findOne(subSkillIds[index]);
  //     subSkills.push(subSkill);
  //   }

  //   skill.relatedSkills = subSkills; // update new skill[]

  //   try {
  //     return await this.skillsRepository.save(skill);
  //   } catch (error) {
  //     throw new BadRequestException('Failed to update skill');
  //   }
  // }

  async selectChild(parentId: string, childrenId: string[]): Promise<Skill> {
    const parentSkill = await this.findOne(parentId); // Ensure the skill exists
    for (let index = 0; index < childrenId.length; index++) {
      parentSkill.children.push(await this.findOne(childrenId[index]));
    }
    try {
      return await this.skillsRepository.save(parentSkill);
    } catch (error) {
      throw new BadRequestException('Failed to select Children');
    }
  }

  // Optional
  async removeChildSkill(id: string, childId: string): Promise<Skill> {
    const parentSkill = await this.findOne(id); // Ensure the skill exists

    parentSkill.children = parentSkill.children.filter(
      (children) => children.id !== childId,
    );

    try {
      return await this.skillsRepository.save(parentSkill);
    } catch (error) {
      throw new BadRequestException('Failed to remove childSkill');
    }
  }

  async updateTechSkills(id: string, techSkillIds: string[]): Promise<Skill> {
    const skill = await this.findOne(id); // Ensure the skill exists

    const techSkills = [];
    for (let index = 0; index < techSkillIds.length; index++) {
      const subSkill = await this.findOne(techSkillIds[index]);
      techSkills.push(subSkill);
    }

    skill.techSkills = techSkills; // update new skill[]

    try {
      return await this.skillsRepository.save(skill);
    } catch (error) {
      throw new BadRequestException('Failed to update skill');
    }
  }

  // Optional
  async removeTechSkill(id: string, techId: string): Promise<Skill> {
    const skill = await this.findOne(id); // Ensure the skill exists
    skill.techSkills = skill.techSkills.filter(
      (techSkill) => techSkill.id !== techId,
    );
    try {
      return await this.skillsRepository.save(skill);
    } catch (error) {
      throw new BadRequestException('Failed to remove subSkill');
    }
  }

  async remove(id: string): Promise<void> {
    const skill = await this.findOne(id); // Ensure the skill exists
    console.log(skill);
    try {
      await this.skillsRepository.remove(skill);
    } catch (error) {
      throw new BadRequestException('Failed to remove skill');
    }
  }
}
