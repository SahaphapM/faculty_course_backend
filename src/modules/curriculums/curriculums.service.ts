import {
  BadRequestException,
  HttpStatus,
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
import { Subject } from 'src/entities/subject.entity';

@Injectable()
export class CurriculumsService {
  constructor(
    @InjectRepository(Subject)
    private subRepo: Repository<Subject>,
    @InjectRepository(Curriculum)
    private currRepo: Repository<Curriculum>,
    @InjectRepository(Skill)
    private skillRepo: Repository<Skill>,
    @InjectRepository(Branch)
    private braRepo: Repository<Branch>,
  ) {}

  async create(dto: CreateCurriculumDto) {
    const curriculum = this.currRepo.create(dto);
    try {
      if (dto.branch) {
        const branch = await this.braRepo.findOneBy({ id: dto.branch.id });
        if (!branch) {
          throw new NotFoundException(
            `Branch with IDs ${dto.branch} not found`,
          );
        }
        curriculum.branch = branch;
      }
      await this.currRepo.save(curriculum);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Curriculum created successfully',
        data: curriculum,
      };
    } catch (error) {
      throw new BadRequestException(
        'Failed to create Curriculum ',
        error.message,
      );
    }
  }

  // async findAll(pag?: PaginationDto) {
  //   const defaultLimit = 10;
  //   const defaultPage = 1;

  //   const options: FindManyOptions<Curriculum> = {
  //     relationLoadStrategy: 'query',
  //     relations: {
  //       plos: true,
  //       branch: true,
  //       coordinators: true,
  //     },
  //     select: {
  //       id: true,
  //       code: true,
  //       thaiName: true,
  //       thaiDescription: true,
  //       minimumGrade: true,
  //       thaiDegree: true,
  //       engDegree: true,
  //       engName: true,
  //       period: true,
  //       branch: { id: true, name: true },
  //       coordinators: { id: true, thaiName: true },
  //     },
  //   };

  //   try {
  //     if (pag) {
  //       const { search, limit, page, order, facultyName, branchName } = pag;

  //       options.take = limit || defaultLimit;
  //       options.skip = ((page || defaultPage) - 1) * (limit || defaultLimit);
  //       options.order = { id: order || 'ASC' };
  //       options.where = {};

  //       if (search) {
  //         options.where.thaiName = Like(`%${search}%`);
  //       }
  //       if (facultyName) {
  //         options.where.branch = {
  //           faculty: { name: Like(`%${facultyName}%`) },
  //         };
  //       }
  //       if (branchName) {
  //         options.where.branch = { name: Like(`%${branchName}%`) };
  //       }

  //       return await this.currRepo.findAndCount(options);
  //     } else {
  //       return await this.currRepo.find(options);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching curriculums:', error);
  //     throw new InternalServerErrorException('Failed to fetch curriculums');
  //   }
  // }

  async findAll(pag?: PaginationDto) {
    const defaultLimit = 15;
    const defaultPage = 1;

    const options: FindManyOptions<Curriculum> = {
      relations: ['branch'],
      select: [
        'id',
        'code',
        'thaiName',
        'thaiDescription',
        'minimumGrade',
        'thaiDegree',
        'engDegree',
        'engName',
        'period',
      ],
    };

    try {
      if (pag) {
        const { search, limit, page, order, facultyName, branchName } = pag;

        options.take = limit || defaultLimit;
        options.skip = ((page || defaultPage) - 1) * (limit || defaultLimit);
        options.order = { id: order || 'ASC' };

        options.where = {
          ...(search && { thaiName: Like(`%${search}%`) }),
          ...(facultyName && {
            branch: { faculty: { name: Like(`%${facultyName}%`) } },
          }),
          ...(branchName && { branch: { name: Like(`%${branchName}%`) } }),
        };

        return await this.currRepo.findAndCount(options);
      } else {
        return await this.currRepo.find(options);
      }
    } catch (error) {
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
        // subjects: true,
        courseSpecs: {
          clos: true,
          subject: true,
        },
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

    this.currRepo.merge(curriculum, dto);
    // // Course Spec Handle + create subjects
    // if (dto.courseSpecs.length) {
    //   curriculum.subjects = [];

    //   for (const courseSpec of dto.courseSpecs) {
    //     curriculum.courseSpecs.map((cs) => {
    //       cs.curriculum = curriculum;
    //     });
    //     const subject = this.subRepo.create({ ...courseSpec.subject });
    //     curriculum.subjects.push(subject);
    //   }
    // }

    // Save everything in one transaction
    this.currRepo.save(curriculum);

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
