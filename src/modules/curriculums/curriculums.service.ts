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
import { Subject } from 'src/entities/subject.entity';
import { PaginationDto } from 'src/dto/pagination.dto';
import { BranchesService } from '../branches/branches.service';
import { Skill } from 'src/entities/skill.entity';

@Injectable()
export class CurriculumsService {
  constructor(
    @InjectRepository(Curriculum)
    private currRepo: Repository<Curriculum>,

    // private readonly ploService: PlosService,
    // private readonly subService: SubjectsService,
    private readonly braService: BranchesService,
    private readonly skillRepo: Repository<Skill>,
    // private readonly insService: InstructorsService,
  ) {}

  // just pure empty insert for get id
  async insert(p0: {
    name: string;
    engName: string;
    degree: string;
    engDegree: string;
    description: string;
    period: number;
    minimumGrade: number;
  }) {
    const insertResult = await this.currRepo.insert(p0);
    return insertResult.identifiers[0].id;
  }

  async create(dto: CreateCurriculumDto): Promise<Curriculum> {
    const curriculum = this.currRepo.create(dto);
    try {
      if (dto.branchId) {
        const branch = await this.braService.findOne(dto.branchId);
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
          options.where.push({ id: Like(`%${search}%`) });
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

  async findOne(id: string): Promise<Curriculum> {
    const curriculum = await this.currRepo.findOne({
      where: { id },
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
      throw new NotFoundException(`Curriculum with ID '${id}' not found`);
    }
    return curriculum;
  }

  async update(id: string, dto: UpdateCurriculumDto) {
    const curriculum = await this.findOne(id);

    if (!curriculum) {
      throw new NotFoundException(`Curriculum with ID ${id} not found`);
    }

    // Merge existing entity with new data
    this.currRepo.merge(curriculum, dto);

    // ✅ Handle Skills (Tree Structure)
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
            this.skillRepo.merge(skill, skillDto);
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

    if (dto.branchId) {
      const branch = await this.braService.findOne(dto.branchId);
      if (!branch) {
        throw new NotFoundException(`Branch with ID ${dto.branchId} not found`);
      }
      curriculum.branch = branch;
    }

    try {
      await this.currRepo.save(curriculum); // ✅ Save the updated entity
    } catch (error) {
      throw new BadRequestException(
        'Failed to update Curriculum',
        error.message,
      );
    }
  }

  async addSubject(id: string, subjects: Subject[]): Promise<Curriculum> {
    const curriculum = await this.findOne(id);
    if (!curriculum) {
      throw new NotFoundException(`Curriculum with ID ${id} not found`);
    }

    // Assign subjects directly to the curriculum
    curriculum.subjects = subjects;

    try {
      await this.currRepo.save(curriculum);
      return this.currRepo.findOne({
        where: { id },
        relations: { subjects: true },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to update Curriculum',
        error.message,
      );
    }
  }

  async selectSubject(id: string, subjects: Subject[]): Promise<Curriculum> {
    const curriculum = await this.findOne(id);
    if (!curriculum) {
      throw new NotFoundException(`Curriculum with ID ${id} not found`);
    }
    curriculum.subjects = subjects;
    try {
      await this.currRepo.save(curriculum);
      return this.currRepo.findOne({
        where: { id },
        relations: { subjects: true },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to update Curriculum',
        error.message,
      );
    }
  }

  // async addCoordinator(
  //   id: string,
  //   teacherListId: number[],
  // ): Promise<Curriculum> {
  //   console.log('addCoordinator', teacherListId);
  //   const curriculum = await this.findOne(id);
  //   if (!curriculum) {
  //     throw new NotFoundException(`Curriculum with ID ${id} not found`);
  //   }
  //   curriculum.coordinators = [];
  //   if (teacherListId) {
  //     for (let index = 0; index < teacherListId.length; index++) {
  //       const teacher = await this.insService.findOne(teacherListId[index]);
  //       curriculum.coordinators.push(teacher);
  //     }
  //   }
  //   try {
  //     await this.currRepo.save(curriculum);
  //     return this.currRepo.findOne({
  //       where: { id },
  //     });
  //   } catch (error) {
  //     throw new BadRequestException(
  //       'Failed to update Curriculum',
  //       error.message,
  //     );
  //   }
  // }

  // async addPLO(id: string, plo: Plo): Promise<Curriculum> {
  //   const curriculum = await this.findOne(id);
  //   if (!curriculum) {
  //     throw new NotFoundException(`Curriculum with ID ${id} not found`);
  //   }
  //   if (!curriculum.plos) {
  //     curriculum.plos = [];
  //   }
  //   curriculum.plos.push(plo);
  //   try {
  //     await this.currRepo.save(curriculum);
  //     return this.currRepo.findOne({
  //       where: { id },
  //       relations: { plos: true },
  //     });
  //   } catch (error) {
  //     throw new BadRequestException(
  //       'Failed to update Curriculum',
  //       error.message,
  //     );
  //   }
  // }

  async remove(id: string): Promise<void> {
    const curriculum = await this.findOne(id);
    try {
      await this.currRepo.remove(curriculum);
    } catch (error) {
      throw new BadRequestException('Failed to remove user');
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
