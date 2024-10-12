import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCurriculumDto } from '../../dto/curriculum/create-curriculum.dto';
import { UpdateCurriculumDto } from '../../dto/curriculum/update-curriculum.dto';
import { Curriculum } from '../../entities/curriculum.entity';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from 'src/entities/subject.entity';
import { Plo } from 'src/entities/plo.entity';
import { TeachersService } from 'src/modules/teachers/teachers.service';
import { PaginationDto } from 'src/dto/pagination.dto';

@Injectable()
export class CurriculumsService {
  constructor(
    @InjectRepository(Curriculum)
    private curriculumsRepository: Repository<Curriculum>,

    private readonly teachersService: TeachersService,
  ) {}

  async findAllByPage(
    paginationDto: PaginationDto,
  ): Promise<{ data: Curriculum[]; total: number }> {
    const { page, limit, sort, order, search } = paginationDto;

    const options: FindManyOptions<Curriculum> = {
      relations: [
        'coordinators',
        'plos',
        'subjects',
        'branch',
        'branch.faculty',
      ],
      take: limit,
      skip: (page - 1) * limit,
      order: sort ? { [sort]: order } : {},
    };

    if (search) {
      options.where = [
        { id: Like(`%${search}%`) },
        { thaiName: Like(`%${search}%`) },
        { engName: Like(`%${search}%`) },
        { branch: { name: Like(`%${search}%`) } }, // Corrected for nested relation
        { branch: { faculty: { name: Like(`%${search}%`) } } },
      ];
    }

    const [result, total] =
      await this.curriculumsRepository.findAndCount(options);

    return { data: result, total };
  }

  async create(createCurriculumDto: CreateCurriculumDto): Promise<Curriculum> {
    const curriculum = this.curriculumsRepository.create(createCurriculumDto);
    try {
      await this.curriculumsRepository.save(curriculum);
      const id = curriculum.id;
      return this.curriculumsRepository.findOne({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to create Curriculum ',
        error.message,
      );
    }
  }

  async findAll(): Promise<Curriculum[]> {
    return await this.curriculumsRepository.find({
      relations: {
        plos: true,
        subjects: true,
        branch: true,
      },
    });
  }

  async findOne(id: string): Promise<Curriculum> {
    const curriculum = await this.curriculumsRepository.findOne({
      where: { id },
      relations: {
        plos: true,
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

  async update(
    id: string,
    updateCurriculumDto: UpdateCurriculumDto,
  ): Promise<Curriculum> {
    const curriculum = await this.findOne(id);

    if (!curriculum) {
      throw new NotFoundException(`Curriculum with ID ${id} not found`);
    }

    this.curriculumsRepository.merge(curriculum, updateCurriculumDto); // directly merge is not to delete the first data.
    curriculum.plos = updateCurriculumDto.plos;
    curriculum.subjects = updateCurriculumDto.subjects;
    // Object.assign(curriculum, updateCurriculumDto); // directly create new delete the first data to new value.

    try {
      await this.curriculumsRepository.save(curriculum);
      return this.curriculumsRepository.findOne({
        where: { id },
      });
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
      await this.curriculumsRepository.save(curriculum);
      return this.curriculumsRepository.findOne({
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
      await this.curriculumsRepository.save(curriculum);
      return this.curriculumsRepository.findOne({
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

  async addCoordinator(
    id: string,
    teacherListId: number[],
  ): Promise<Curriculum> {
    console.log('addCoordinator', teacherListId);
    const curriculum = await this.findOne(id);
    if (!curriculum) {
      throw new NotFoundException(`Curriculum with ID ${id} not found`);
    }
    curriculum.coordinators = [];
    if (teacherListId) {
      for (let index = 0; index < teacherListId.length; index++) {
        const teacher = await this.teachersService.findOne(
          teacherListId[index],
        );
        curriculum.coordinators.push(teacher);
      }
    }
    try {
      await this.curriculumsRepository.save(curriculum);
      return this.curriculumsRepository.findOne({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to update Curriculum',
        error.message,
      );
    }
  }

  async addPLO(id: string, plo: Plo): Promise<Curriculum> {
    const curriculum = await this.findOne(id);
    if (!curriculum) {
      throw new NotFoundException(`Curriculum with ID ${id} not found`);
    }
    if (!curriculum.plos) {
      curriculum.plos = [];
    }
    curriculum.plos.push(plo);
    try {
      await this.curriculumsRepository.save(curriculum);
      return this.curriculumsRepository.findOne({
        where: { id },
        relations: { plos: true },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to update Curriculum',
        error.message,
      );
    }
  }

  async remove(id: string): Promise<void> {
    const curriculum = await this.findOne(id);
    try {
      await this.curriculumsRepository.remove(curriculum);
    } catch (error) {
      throw new BadRequestException('Failed to remove user');
    }
  }
}
