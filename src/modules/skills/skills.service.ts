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
import { LearningDomain } from 'src/enums/learning-domain.enum';

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
      where: { id: createSkillDto.curriculum.id },
    });

    if (!curriculum) {
      throw new NotFoundException(
        `Curriculum with ID ${createSkillDto.curriculum} not found`,
      );
    }
    const skill = this.skRepo.create({
      ...createSkillDto,
      curriculum: curriculum,
    });

    try {
      return await this.skRepo.save(skill);
    } catch (error) {
      throw new BadRequestException(
        'Failed to create skill',
        createSkillDto.thaiName,
      );
    }
  }

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
        curriculum: { id: true, thaiName: true },
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(id: number, updateSkillDto: UpdateSkillDto): Promise<Skill> {
    const skill = await this.findOne(id); // Ensure the skill exists

    if (!skill) {
      throw new NotFoundException(`Skill with id ${id} not found`);
    }

    try {
      return await this.skRepo.save({
        ...skill,
        ...updateSkillDto,
      });
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

  // async selectSubSkills(id: number, createSkillDto: CreateSkillDto) {
  //   console.log(createSkillDto);
  //   const parentSkill = await this.findOne(id);

  //   parentSkill.children = parentSkill.children || []; // initialize children

  // find child skill in database
  // const subSkill = await this.findOne(createSkillDto.id);

  // Check if subSkill already related to parentSkill
  // const isAlreadyRelated = parentSkill.children.some(
  //   (child) => child.id.toString() === subSkill.id.toString(),
  // );

  // If not already related, add the subSkill to subSkills
  // if (!isAlreadyRelated) {
  //   parentSkill.children.push(subSkill);
  //   try {
  //     return await this.skRepo.save(parentSkill);
  //   } catch (error) {
  //     throw new BadRequestException('Failed to select childSkill');
  //   }
  // }
  // }

  async createSubSkills(
    parentId: number,
    createSkillDto: CreateSkillDto,
  ): Promise<Skill> {
    // หา parentSkill จาก id
    console.log('parentId', parentId);
    const parentSkill = await this.findOne(parentId);

    console.log(createSkillDto);

    // หา curriculum จาก createSkillDto หรือ parentSkill
    const curriculum = await this.curriculumRepo.findOne({
      where: { id: createSkillDto.curriculum.id || parentSkill.curriculum.id },
    });

    if (!curriculum) {
      throw new NotFoundException(
        `Curriculum with ID ${createSkillDto.curriculum} not found`,
      );
    }

    // สร้าง subSkill จาก createSkillDto
    const subSkill = new Skill();
    subSkill.thaiName = createSkillDto.thaiName;
    subSkill.engName = createSkillDto.engName;
    subSkill.thaiDescription = createSkillDto.thaiDescription;
    subSkill.engDescription = createSkillDto.engDescription;
    subSkill.domain = createSkillDto.domain || LearningDomain.Psychomotor;
    subSkill.curriculum = curriculum;

    // กำหนด parent ให้กับ subSkill
    subSkill.parent = parentSkill;

    // บันทึก subSkill ลงในฐานข้อมูล
    const savedSubSkill = await this.skRepo.save(subSkill);

    return savedSubSkill;
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
