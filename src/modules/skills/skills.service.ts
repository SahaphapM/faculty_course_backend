import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Skill } from '../../entities/skill.entity';
import { Brackets, TreeRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TechSkill } from 'src/entities/tech-skill.entity';
import { PaginationDto } from 'src/dto/pagination.dto';
import { CreateSkillDto } from 'src/dto/skill/create-skill.dto';
import { UpdateSkillDto } from 'src/dto/skill/update-skill.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private skillsRepository: TreeRepository<Skill>,
  ) {}

  async create(createSkillDto: CreateSkillDto): Promise<Skill> {
    console.log(createSkillDto);

    try {
      return await this.skillsRepository.save(createSkillDto);
    } catch (error) {
      throw new BadRequestException(
        'Failed to create skill',
        createSkillDto.name,
      );
    }
  }

  async findAllByPage(
    paginationDto: PaginationDto,
  ): Promise<{ data: Skill[]; total: number }> {
    const { page, limit, sort, order, search, bySubject } = paginationDto;

    const queryBuilder = this.skillsRepository.createQueryBuilder('skill');

    // Join relations to include them in the result
    queryBuilder
      .where('skill.parentId IS NULL') // Correctly check for NULL
      .leftJoinAndSelect('skill.skillDetail', 'skillDetail')
      .leftJoinAndSelect('skillDetail.subjects', 'subject')
      .leftJoinAndSelect('skill.children', 'children') // For direct children
      .leftJoinAndSelect('children.children', 'grandchildren') // For children of children
      .leftJoinAndSelect('grandchildren.children', 'greatGrandchildren') // Children of grandchildren
      .leftJoinAndSelect('skill.techSkills', 'techSkills');

    // Conditionally add joins based on bySubject
    if (bySubject) {
      queryBuilder.andWhere('subject.id = :subjectId', {
        subjectId: bySubject,
      });
    }
    // Add search condition if provided

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('skill.name LIKE :search', {
            search: `%${search}%`,
          }).orWhere('skill.description LIKE :search', {
            search: `%${search}%`,
          });
        }),
      );
    }

    // Pagination
    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy(`skill.${sort || 'id'}`, order || 'ASC')
      .getManyAndCount();

    return { data, total };
  }

  async findAll(): Promise<Skill[]> {
    const queryBuilder = this.skillsRepository.createQueryBuilder('skill');

    queryBuilder
      .where('skill.parentId IS NULL') // Correctly check for NULL
      .leftJoinAndSelect('skill.skillDetail', 'skillDetail')
      .leftJoinAndSelect('skillDetail.subjects', 'subject')
      .leftJoinAndSelect('skill.children', 'children') // For direct children
      .leftJoinAndSelect('children.children', 'grandchildren') // For children of children
      .leftJoinAndSelect('grandchildren.children', 'greatGrandchildren') // Children of grandchildren
      .leftJoinAndSelect('skill.techSkills', 'techSkills');

    // .where('skill.parentId IS NULL') // Check where parentId is null
    // .leftJoinAndSelect['skill.skillDetail', 'skillDetail']
    const skills = await queryBuilder.getMany();

    return skills;
  }

  async findOne(id: string): Promise<Skill> {
    const skill = await this.skillsRepository.findOne({
      where: { id: Number(id) },
      relations: {
        children: { children: { children: { children: { children: true } } } },
        parent: true,
        techSkills: true,
      },
    });
    if (!skill) {
      throw new NotFoundException(`Skill with id ${id} not found`);
    }
    return skill;
  }

  async update(id: string, updateSkillDto: UpdateSkillDto): Promise<Skill> {
    await this.findOne(id); // Ensure the skill exists
    const skill = await this.skillsRepository.preload({
      id: Number(id),
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

  async remove(id: string): Promise<void> {
    const skill = await this.findOne(id); // Ensure the skill exists
    console.log(skill);
    try {
      await this.skillsRepository.remove(skill);
    } catch (error) {
      throw new BadRequestException('Failed to remove skill');
    }
  }

  async selectSubSkills(
    id: string,
    createSkillDto: CreateSkillDto,
  ): Promise<Skill> {
    console.log(createSkillDto);
    const parentSkill = await this.findOne(id);

    parentSkill.children = parentSkill.children || []; // initialize children

    // find child skill in database
    const subSkill = await this.findOne(createSkillDto.id.toString());

    // Check if subSkill already related to parentSkill
    const isAlreadyRelated = parentSkill.children.some(
      (child) => child.id.toString() === subSkill.id.toString(),
    );

    // If not already related, add the subSkill to subSkills
    if (!isAlreadyRelated) {
      parentSkill.children.push(subSkill);
      try {
        return await this.skillsRepository.save(parentSkill);
      } catch (error) {
        throw new BadRequestException('Failed to select childSkill');
      }
    }
  }

  async createSubSkills(
    id: string,
    createSkillDto: CreateSkillDto,
  ): Promise<Skill> {
    const parentSkill = await this.findOne(id);

    parentSkill.children = parentSkill.children || []; // initialize children

    const subSkill = await this.skillsRepository.save(createSkillDto);

    parentSkill.children.push(subSkill);

    try {
      return await this.skillsRepository.save(parentSkill);
    } catch (error) {
      throw new BadRequestException('Failed to create childSkill');
    }
  }

  async removeSubSkillId(id: string, subSkillId: string): Promise<Skill> {
    const parentSkill = await this.findOne(id); // Ensure the skill exists
    const childSkill = await this.findOne(subSkillId);
    parentSkill.children = parentSkill.children.filter(
      (children) => children.id.toString() !== subSkillId, //Remove child of parent//+
    );
    childSkill.parent = null; // Parent of child = null
    try {
      this.skillsRepository.save(childSkill);
      return await this.skillsRepository.save(parentSkill);
    } catch (error) {
      throw new BadRequestException('Failed to remove subSkill');
    }
  }

  async createTechSkills(id: string, techSkills: TechSkill[]): Promise<Skill> {
    const skill = await this.findOne(id);
    for (const techSkill of techSkills) {
      // Check if the techSkill already exists in the skill's techSkills
      const existingTechSkill = skill.techSkills.find(
        (existing) => existing.id === techSkill.id,
      );

      // Only add the techSkill if it doesn't already exist
      if (!existingTechSkill) {
        skill.techSkills.push(techSkill);
      }
    }

    try {
      return await this.skillsRepository.save(skill);
    } catch (error) {
      throw new BadRequestException('Failed to create and select techSkills');
    }
  }

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
}
