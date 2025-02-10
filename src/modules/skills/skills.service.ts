import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Skill } from '../../entities/skill.entity';
import { FindManyOptions, Like, Repository, TreeRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/dto/pagination.dto';
import { CreateSkillDto } from 'src/dto/skill/create-skill.dto';
import { UpdateSkillDto } from 'src/dto/skill/update-skill.dto';
import { Curriculum } from 'src/entities/curriculum.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private skRepo: TreeRepository<Skill>,

    @InjectRepository(Curriculum)
    private curriculumRepo: Repository<Curriculum>,
  ) {}

  async create(createSkillDto: CreateSkillDto): Promise<Skill> {
    const curriculum = await this.curriculumRepo.findOne({
      where: { id: createSkillDto.curriculumId },
    });

    if (!curriculum) {
      throw new NotFoundException(
        `Curriculum with ID ${createSkillDto.curriculumId} not found`,
      );
    }
    const skill = this.skRepo.create(createSkillDto);
    skill.curriculum = curriculum;

    try {
      return await this.skRepo.save(skill);
    } catch (error) {
      throw new BadRequestException(
        'Failed to create skill',
        createSkillDto.name,
      );
    }
  }

  // async findAllByPage(
  //   paginationDto: PaginationDto,
  // ): Promise<{ data: Skill[]; total: number }> {
  //   const { page, limit, sort, order, search, bySubject } = paginationDto;

  //   const queryBuilder = this.skillsRepository.createQueryBuilder('skill');

  //   // Join relations to include them in the result
  //   queryBuilder
  //     .where('skill.parentId IS NULL') // Correctly check for NULL
  //     .leftJoinAndSelect('skill.skillExpectedLevels', 'skillExpectedLevels')
  //     .leftJoinAndSelect('skillExpectedLevels.subject', 'subject')
  //     .leftJoinAndSelect('skill.children', 'children') // For direct children
  //     .leftJoinAndSelect('children.children', 'grandchildren') // For children of children
  //     .leftJoinAndSelect('grandchildren.children', 'greatGrandchildren') // Children of grandchildren
  //     .leftJoinAndSelect('skill.techSkills', 'techSkills');

  //   // Conditionally add joins based on bySubject
  //   if (bySubject) {
  //     queryBuilder.andWhere('subject.id = :subjectId', {
  //       subjectId: bySubject,
  //     });
  //   }
  //   // Add search condition if provided

  //   if (search) {
  //     queryBuilder.andWhere(
  //       new Brackets((qb) => {
  //         qb.where('skill.name LIKE :search', {
  //           search: `%${search}%`,
  //         }).orWhere('skill.description LIKE :search', {
  //           search: `%${search}%`,
  //         });
  //       }),
  //     );
  //   }

  //   // Pagination
  //   const [data, total] = await queryBuilder
  //     .skip((page - 1) * limit)
  //     .take(limit)
  //     .orderBy(`skill.${sort || 'id'}`, order || 'ASC')
  //     .getManyAndCount();

  //   return { data, total };
  // }

  // async findAll(): Promise<Skill[]> {
  //   const queryBuilder = this.skillsRepository.createQueryBuilder('skill');

  //   queryBuilder
  //     .where('skill.parentId IS NULL') // Correctly check for NULL
  //     .leftJoinAndSelect('skill.skillExpectedLevels', 'skillExpectedLevels')
  //     .leftJoinAndSelect('skillExpectedLevels.subjects', 'subject')
  //     .leftJoinAndSelect('skill.children', 'children') // For direct children
  //     .leftJoinAndSelect('children.children', 'grandchildren') // For children of children
  //     .leftJoinAndSelect('grandchildren.children', 'greatGrandchildren') // Children of grandchildren
  //     .leftJoinAndSelect('skill.techSkills', 'techSkills');

  //   // .where('skill.parentId IS NULL') // Check where parentId is null
  //   // .leftJoinAndSelect['skill.skillExpectedLevels', 'skillExpectedLevels']
  //   const skills = await queryBuilder.getMany();

  //   return skills;
  // }

  async findAll(pag?: PaginationDto) {
    const defaultLimit = 10;
    const defaultPage = 1;

    const options: FindManyOptions<Skill> = {
      relationLoadStrategy: 'query',
      relations: { children: true },
      select: {
        id: true,
        thaiName: true,
        engName: true,
        thaiDescription: true,
        engDescription: true,
        domain: true,
        parent: { id: true, thaiName: true, engName: true },
        curriculum: { id: true, name: true },
      },
    };
    try {
      if (pag) {
        const { search, limit, page, order } = pag;

        options.take = limit || defaultLimit;
        options.skip = ((page || defaultPage) - 1) * (limit || defaultLimit);
        options.order = { id: order || 'ASC' };

        if (search) {
          options.where = [
            { thaiName: Like(`%${search}%`) },
            { engName: Like(`%${search}%`) },
            { thaiDescription: Like(`%${search}%`) },
            { engDescription: Like(`%${search}%`) },
          ];
        }
        return await this.skRepo.findAndCount(options);
      } else {
        return await this.skRepo.find(options);
      }
    } catch (error) {
      // Log the error for debugging
      console.error('Error fetching skills:', error);
      throw new InternalServerErrorException('Failed to fetch skills');
    }
  }

  async findAllByCurriculum(curriculumId: number) {
    const curriculum = await this.curriculumRepo.findOne({
      where: { id: curriculumId },
    });

    if (!curriculum) {
      throw new NotFoundException(
        `Curriculum with ID ${curriculumId} not found`,
      );
    }

    const skills = await this.skRepo.find({
      where: { curriculum: { id: curriculumId } },
      relations: { children: { children: true } },
    });

    return skills;
  }

  async findOne(id: number): Promise<Skill> {
    const skill = await this.skRepo.findOne({
      where: { id: Number(id) },
      relations: {
        children: { children: { children: { children: { children: true } } } },
        parent: true,
        curriculum: true,
      },
    });
    if (!skill) {
      throw new NotFoundException(`Skill with id ${id} not found`);
    }
    return skill;
  }

  async update(id: number, updateSkillDto: UpdateSkillDto): Promise<Skill> {
    await this.findOne(id); // Ensure the skill exists
    const skill = await this.skRepo.preload({
      id: Number(id),
      ...updateSkillDto,
    });

    if (!skill) {
      throw new NotFoundException(`Skill with id ${id} not found`);
    }

    try {
      return await this.skRepo.save(skill);
    } catch (error) {
      throw new BadRequestException('Failed to update skill');
    }
  }

  async remove(id: number): Promise<void> {
    const skill = await this.findOne(id); // Ensure the skill exists
    console.log(skill);
    try {
      await this.skRepo.remove(skill);
    } catch (error) {
      throw new BadRequestException('Failed to remove skill');
    }
  }

  async selectSubSkills(
    id: number,
    createSkillDto: CreateSkillDto,
  ): Promise<Skill> {
    console.log(createSkillDto);
    const parentSkill = await this.findOne(id);

    parentSkill.children = parentSkill.children || []; // initialize children

    // find child skill in database
    const subSkill = await this.findOne(createSkillDto.id);

    // Check if subSkill already related to parentSkill
    const isAlreadyRelated = parentSkill.children.some(
      (child) => child.id.toString() === subSkill.id.toString(),
    );

    // If not already related, add the subSkill to subSkills
    if (!isAlreadyRelated) {
      parentSkill.children.push(subSkill);
      try {
        return await this.skRepo.save(parentSkill);
      } catch (error) {
        throw new BadRequestException('Failed to select childSkill');
      }
    }
  }

  async createSubSkills(
    id: number,
    createSkillDto: CreateSkillDto,
  ): Promise<Skill> {
    const parentSkill = await this.findOne(id);

    const curriculum = await this.curriculumRepo.findOne({
      where: { id: createSkillDto.curriculumId || parentSkill.curriculum.id },
    });

    if (!curriculum) {
      throw new NotFoundException(
        `Curriculum with ID ${createSkillDto.curriculumId} not found`,
      );
    }

    parentSkill.children = parentSkill.children || []; // initialize children

    const subSkill = await this.skRepo.save({
      ...createSkillDto,
      curriculum,
    });

    parentSkill.children.push(subSkill);

    try {
      return await this.skRepo.save(parentSkill);
    } catch (error) {
      throw new BadRequestException('Failed to create childSkill');
    }
  }

  async removeSubSkillId(id: number, subSkillId: number): Promise<Skill> {
    const parentSkill = await this.findOne(id); // Ensure the skill exists
    const childSkill = await this.findOne(subSkillId);
    parentSkill.children = parentSkill.children.filter(
      (children) => children.id !== subSkillId, //Remove child of parent//+
    );
    childSkill.parent = null; // Parent of child = null
    try {
      this.skRepo.save(childSkill);
      return await this.skRepo.save(parentSkill);
    } catch (error) {
      throw new BadRequestException('Failed to remove subSkill');
    }
  }
}
