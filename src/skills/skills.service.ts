import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from './entities/skill.entity';
import { Brackets, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from './dto/pagination.dto';
import { TechSkill } from 'src/tech-skills/entities/tech-skill.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private skillsRepository: Repository<Skill>,
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

  async findAllByPage(
    paginationDto: PaginationDto,
  ): Promise<{ data: Skill[]; total: number }> {
    const { page, limit, sort, order, search, bySubject } = paginationDto;

    const queryBuilder = this.skillsRepository.createQueryBuilder('skill');

    // Join relations to include them in the result
    queryBuilder
      .leftJoinAndSelect('skill.subjects', 'subject')
      .leftJoinAndSelect('skill.subSkills', 'subSkills')
      .leftJoinAndSelect('skill.techSkills', 'techSkills');

    // Conditionally add joins based on bySubject
    if (bySubject) {
      queryBuilder.andWhere('subject.id = :subjectId', {
        subjectId: bySubject,
      });
    }

    // if (byBranch || byFaculty) {
    //   queryBuilder
    //     .innerJoinAndSelect('skill.techSkills', 'techSkill')
    //     .innerJoinAndSelect('techSkill.branch', 'branch') // Adjust according to your actual entity relations
    //     .innerJoinAndSelect('branch.faculty', 'faculty'); // Adjust according to your actual entity relations

    //   if (byBranch) {
    //     queryBuilder.andWhere('branch.id = :branchId', { branchId: byBranch });
    //   }

    //   if (byFaculty) {
    //     queryBuilder.andWhere('faculty.id = :facultyId', {
    //       facultyId: byFaculty,
    //     });
    //   }
    // }

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
    return await this.skillsRepository.find({
      relations: {
        subjects: true,
        subSkills: true,
        techSkills: true,
      },
    });
  }

  async findOne(id: string): Promise<Skill> {
    const skill = await this.skillsRepository.findOne({
      where: { id },
      relations: {
        subjects: true,
        subSkills: true,
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

  async remove(id: string): Promise<void> {
    const skill = await this.findOne(id); // Ensure the skill exists
    console.log(skill);
    try {
      await this.skillsRepository.remove(skill);
    } catch (error) {
      throw new BadRequestException('Failed to remove skill');
    }
  }

  async createSubSkills(
    id: string,
    createSkillDtos: CreateSkillDto[],
  ): Promise<Skill> {
    const skill = await this.findOne(id);
    console.log(skill.subSkills);
    for (const createSkillDto of createSkillDtos) {
      let subSkill = await this.skillsRepository.findOne({
        where: { id: createSkillDto.id },
      });

      // If the subSkill doesn't exist, create and save it
      if (!subSkill) {
        subSkill = await this.skillsRepository.save(createSkillDto);
      }

      // Check if the subSkill is already related to the main skill
      const isAlreadyRelated = skill.subSkills.some(
        (relatedSkill) => relatedSkill.id === subSkill.id,
      );

      // If not already related, add the subSkill to subSkills
      if (!isAlreadyRelated) {
        skill.subSkills.push(subSkill);
      }
    }
    try {
      return await this.skillsRepository.save(skill);
    } catch (error) {
      throw new BadRequestException('Failed to create and select subSkills');
    }
  }

  // async selectSubSkills(id: string, subSkillIds: string[]): Promise<Skill> {
  //   const skill = await this.findOne(id); // Ensure the skill exists

  //   const subSkills = [];
  //   for (let index = 0; index < subSkillIds.length; index++) {
  //     const subSkill = await this.findOne(subSkillIds[index]);
  //     subSkills.push(subSkill);
  //   }

  //   skill.subSkills = subSkills; // update new skill[]

  //   try {
  //     return await this.skillsRepository.save(skill);
  //   } catch (error) {
  //     throw new BadRequestException('Failed to update skill');
  //   }
  // }

  // Optional
  async removeSubSkillId(id: string, subSkillId: string): Promise<Skill> {
    const parentSkill = await this.findOne(id); // Ensure the skill exists

    parentSkill.subSkills = parentSkill.subSkills.filter(
      (children) => children.id !== subSkillId,
    );
    console.log(parentSkill.subSkills);
    try {
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

  // async updateTechSkills(id: string, techSkillIds: string[]): Promise<Skill> {
  //   const skill = await this.findOne(id); // Ensure the skill exists

  //   const techSkills = [];
  //   for (let index = 0; index < techSkillIds.length; index++) {
  //     const subSkill = await this.findOne(techSkillIds[index]);
  //     techSkills.push(subSkill);
  //   }

  //   skill.techSkills = techSkills; // update new skill[]

  //   try {
  //     return await this.skillsRepository.save(skill);
  //   } catch (error) {
  //     throw new BadRequestException('Failed to update skill');
  //   }
  // }

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
}
