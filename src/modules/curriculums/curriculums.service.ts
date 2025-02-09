import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCurriculumDto } from '../../dto/curriculum/create-curriculum.dto';
import { UpdateCurriculumDto } from '../../dto/curriculum/update-curriculum.dto';
import { Curriculum } from '../../entities/curriculum.entity';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/dto/pagination.dto';
import { Skill } from 'src/entities/skill.entity';
import { Branch } from 'src/entities/branch.entity';

@Injectable()
export class CurriculumsService {
  constructor(
    @InjectRepository(Curriculum)
    private currRepo: Repository<Curriculum>,
    @InjectRepository(Skill)
    private skillRepo: Repository<Skill>,
    @InjectRepository(Branch)
    private braRepo: Repository<Branch>,
  ) {}

  async create(dto: CreateCurriculumDto): Promise<Curriculum> {
    const curriculum = this.currRepo.create(dto);
    try {
      if (dto.branchId) {
        const branch = await this.braRepo.findOneBy({ id: dto.branchId });
        if (!branch) {
          throw new NotFoundException(
            `Branch with IDs ${dto.branchId} not found`,
          );
        }
        curriculum.branch = branch;
      }
      return await this.currRepo.save(curriculum);
    } catch (error) {
      throw new BadRequestException(
        'Failed to create Curriculum ',
        error.message,
      );
    }
  }

  async findAll(pag?: PaginationDto) {
    const defaultLimit = 10;
    const defaultPage = 1;

    const options: FindManyOptions<Curriculum> = {
      relationLoadStrategy: 'query',
      relations: {
        plos: true,
        subjects: true,
        branch: true,
        coordinators: true,
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        minimumGrade: true,
        degree: true,
        engDegree: true,
        engName: true,
        period: true,
        branch: { id: true, name: true },
        coordinators: { id: true, name: true },
      },
    };
    try {
      if (pag) {
        const { search, limit, page, order, facultyName, branchName } = pag;

        options.take = limit || defaultLimit;
        options.skip = ((page || defaultPage) - 1) * (limit || defaultLimit);
        options.order = { id: order || 'ASC' };
        options.where = [];

        if (search) {
          options.where.push({ name: Like(`%${search}%`) });
        }
        if (facultyName) {
          options.where.push({
            branch: { faculty: { name: Like(`%${facultyName}%`) } },
          });
        }
        if (branchName) {
          options.where.push({ branch: { name: Like(`%${branchName}%`) } });
        }

        return await this.currRepo.findAndCount(options);
      } else {
        return await this.currRepo.find(options);
      }
    } catch (error) {
      // Log the error for debugging
      console.error('Error fetching curriculums:', error);
      throw new InternalServerErrorException('Failed to fetch curriculums');
    }
  }

  async findOneByCode(code: string) {
    const curriculum = await this.currRepo.findOne({
      where: { code },
      relations: {
        plos: true,
        subjects: true,
        branch: true,
        coordinators: true,
        skills: {
          children: true,
        },
      },
    });
    if (!curriculum) {
      throw new NotFoundException(`Curriculum with code '${code}' not found`);
    }
    return curriculum;
  }

  async update(dto: UpdateCurriculumDto) {
    let curriculum = await this.findOneByCode(dto.code);

    if (!curriculum) {
      throw new NotFoundException(`Curriculum with Code ${dto.code} not found`);
    }

    // Merge existing entity with new data
    curriculum = this.currRepo.merge(curriculum, dto);

    // Handle Skills (Tree Structure)
    if (dto.skills) {
      curriculum.skills = await Promise.all(
        dto.skills.map(async (skillDto) => {
          let skill = await this.skillRepo.findOne({
            where: { id: skillDto.id },
            relations: ['parent', 'children'],
          });

          if (!skill) {
            skill = this.skillRepo.create(skillDto);
          } else {
            skill = this.skillRepo.merge(skill, skillDto);
          }

          skill.curriculum = curriculum;

          // If skillDto has a parent, set it
          if (skillDto.parentId) {
            const parentSkill = await this.skillRepo.findOne({
              where: { id: skillDto.parentId },
            });

            if (!parentSkill) {
              throw new NotFoundException(
                `Parent skill with ID ${skillDto.parentId} not found`,
              );
            }
            skill.parent = parentSkill;
          }

          return skill;
        }),
      );
    }

    return await this.currRepo.save(curriculum);
  }

  async remove(code: string): Promise<void> {
    const curriculum = await this.findOneByCode(code);
    try {
      await this.currRepo.remove(curriculum);
    } catch (error) {
      throw new BadRequestException(`Failed to remove curriculum ${code}`);
    }
  }

  async filters(branchId: string): Promise<Curriculum[]> {
    try {
      const curriculums = await this.currRepo
        .createQueryBuilder('curriculum')
        .select(['curriculum.id', 'curriculum.thaiName', 'curriculum.engName'])
        .where('curriculum.branchId = :branchId', { branchId })
        .getMany();
      return curriculums;
    } catch (error) {
      throw new Error(`Failed to fetch details: ${error.message}`);
    }
  }
}
