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
// import { Plo } from 'src/entities/plo.entity';
import { InstructorsService } from 'src/modules/instructors/instructors.service';
import { PaginationDto } from 'src/dto/pagination.dto';
import { BranchesService } from '../branches/branches.service';
import { SubjectsService } from '../subjects/subjects.service';

@Injectable()
export class CurriculumsService {
  constructor(
    @InjectRepository(Curriculum)
    private currRepo: Repository<Curriculum>,

    // private readonly ploService: PlosService,
    private readonly subService: SubjectsService,
    private readonly braService: BranchesService,
    private readonly insService: InstructorsService,
  ) { }

  // async findAllByPage(
  //   paginationDto: PaginationDto,
  // ): Promise<{ data: Curriculum[]; total: number }> {
  //   const { page, limit, sort, order, search } = paginationDto;

  //   const options: FindManyOptions<Curriculum> = {
  //     relations: [
  //       'coordinators',
  //       'plos',
  //       'subjects',
  //       'branch',
  //       'branch.faculty',
  //     ],
  //     take: limit,
  //     skip: (page - 1) * limit,
  //     order: sort ? { [sort]: order } : {},
  //   };

  //   if (search) {
  //     options.where = [
  //       { id: Like(`%${search}%`) },
  //       { thaiName: Like(`%${search}%`) },
  //       { engName: Like(`%${search}%`) },
  //       { branch: { name: Like(`%${search}%`) } }, // Corrected for nested relation
  //       { branch: { faculty: { name: Like(`%${search}%`) } } },
  //     ];
  //   }

  //   const [result, total] = await this.currRepo.findAndCount(options);

  //   return { data: result, total };
  // }

  async create(dto: CreateCurriculumDto): Promise<Curriculum> {
    const curriculum = this.currRepo.create(dto);
    try {
      if (dto.branchId) {
        const branch = await this.braService.findOne(dto.branchId);
        if (!branch) {
          throw new NotFoundException(`Branch with IDs ${dto.branchId} not found`);
        }
        curriculum.branch = branch;
      }

      if (dto.coordinatorListId) {
        const coordinators = await this.insService.findByList(dto.coordinatorListId);
        if (!coordinators) {
          throw new NotFoundException(`Instructor with IDs ${dto.coordinatorListId} not found`);
        }
        curriculum.coordinators = coordinators
      }

      if (dto.subjectListId) {
        const subjects = await this.subService.findByList(dto.subjectListId);
        if (!subjects) {
          throw new NotFoundException(`Subject with IDs ${dto.subjectListId} not found`);
        }
        curriculum.subjects = subjects;
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
        // plos: true,
        subjects: true,
        branch: true,
        coordinators: true
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
      }
    };
    try {
      if (pag) {
        const { search, limit, page, order } = pag;

        options.take = limit || defaultLimit;
        options.skip = ((page || defaultPage) - 1) * (limit || defaultLimit);
        options.order = { id: order || 'ASC' };

        if (search) {
          options.where = [
            { id: Like(`%${search}%`) },
          ];
        }
        return await this.currRepo.findAndCount(options);
      } else {
        return await this.currRepo.find(options);
      }
    } catch (error) {
      // Log the error for debugging
      console.error('Error fetching users:', error);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async findOne(id: string): Promise<Curriculum> {
    const curriculum = await this.currRepo.findOne({
      where: { id },
      relations: {
        // plos: true,
        subjects: true,
        branch: true,
        coordinators: true,
      },
    });
    if (!curriculum) {
      throw new NotFoundException(`Curriculum with ID '${id}' not found`);
    }
    return curriculum;
  }

  async update(id: string, dto: UpdateCurriculumDto) {
    let curriculum = await this.findOne(id);

    if (!curriculum) {
      throw new NotFoundException(`Curriculum with ID ${id} not found`);
    }

    curriculum = this.currRepo.merge(curriculum, dto);

    if (dto.branchId) {
      const branch = await this.braService.findOne(dto.branchId);
      if (!branch) {
        throw new NotFoundException(`Branch with IDs ${dto.branchId} not found`);
      }
      curriculum.branch = branch;
    }

    if (dto.coordinatorListId) {
      const coordinators = await this.insService.findByList(dto.coordinatorListId);
      if (!coordinators) {
        throw new NotFoundException(`Instructor with IDs ${dto.coordinatorListId} not found`);
      }
      curriculum.coordinators = coordinators
    }

    if (dto.subjectListId) {
      const subjects = await this.subService.findByList(dto.subjectListId);
      if (!subjects) {
        throw new NotFoundException(`Subject with IDs ${dto.subjectListId} not found`);
      }
      curriculum.subjects = subjects;
    }

    // if (dto.ploListId) {
    //   const plos = await Promise.all(
    //     dto.ploListId.map((p) => this.ploService.findOne(p)),
    //   );
    //   curriculum.plos = plos;
    // }
    // Object.assign(curriculum, updateCurriculumDto); // directly create new delete the first data to new value.

    try {
      await this.currRepo.save(curriculum);
      // return this.currRepo.findOne({
      //   where: { id },
      // });
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
