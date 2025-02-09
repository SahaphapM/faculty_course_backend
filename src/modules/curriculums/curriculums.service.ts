import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCurriculumDto } from '../../dto/curriculum/create-curriculum.dto';
import { UpdateCurriculumDto } from '../../dto/curriculum/update-curriculum.dto';
import { Curriculum } from '../../entities/curriculum.entity';
import { DataSource, FindManyOptions, Like, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/dto/pagination.dto';
import { Skill } from 'src/entities/skill.entity';
import { Branch } from 'src/entities/branch.entity';

@Injectable()
export class CurriculumsService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
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

  async findOne(id: number) {
    const curriculum = await this.currRepo.findOneBy({ id });
    if (!curriculum) {
      throw new NotFoundException(`Curriculum with code '${id}' not found`);
    }
    return curriculum;
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

  async update(id: number, dto: UpdateCurriculumDto) {
    const curriculum = await this.findOne(id);

    if (!curriculum) {
      throw new NotFoundException(`Curriculum with ID ${id} not found`);
    }

    // ✅ Prevent Duplicate Code
    if (dto.code && dto.code !== curriculum.code) {
      const existing = await this.currRepo.findOne({
        where: { code: dto.code },
      });
      if (existing) {
        throw new ConflictException(
          `A curriculum with Code ${dto.code} already exists.`,
        );
      }
    }

    // ✅ Merge Only Primitive Properties
    this.currRepo.merge(curriculum, dto);

    // Create a TreeRepository for Skill entity
    const skillTreeRepository = this.dataSource.getTreeRepository(Skill);

    // Handle skills update
    if (dto.skills) {
      curriculum.skills = [];

      // Helper function to recursively create skills and their children
      const createSkillWithChildren = async (
        skillData: any,
        parentSkill?: Skill,
      ) => {
        // Create the skill
        const skill = this.skillRepo.create({
          name: skillData.name,
          domain: skillData.domain,
          thaiDescription: skillData.description,
          curriculum: curriculum,
          parent: parentSkill || null,
        });

        // Save the current skill
        const savedSkill = await skillTreeRepository.save(skill);

        // Recursively handle children if they exist
        if (skillData.children && Array.isArray(skillData.children)) {
          for (const childData of skillData.children) {
            await createSkillWithChildren(childData, savedSkill);
          }
        }

        return savedSkill;
      };

      // Process each top-level skill
      for (const skillDto of dto.skills) {
        const savedSkill = await createSkillWithChildren(skillDto);
        curriculum.skills.push(savedSkill);
      }
    }

    // ✅ Save Curriculum & Skills
    await this.currRepo.save(curriculum);

    return {
      statusCode: HttpStatus.OK,
      message: 'Curriculum updated successfully',
    };
  }

  async remove(id: number): Promise<void> {
    const curriculum = await this.findOne(id);
    try {
      await this.currRepo.remove(curriculum);
    } catch (error) {
      throw new BadRequestException(`Failed to remove curriculum ID ${id}`);
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
