import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCurriculumDto } from './dto/create-curriculum.dto';
import { UpdateCurriculumDto } from './dto/update-curriculum.dto';
import { Curriculum } from './entities/curriculum.entity';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from 'src/subjects/entities/subject.entity';
import { User } from 'src/users/entities/user.entity';
import { Plo } from 'src/plos/entities/plo.entity';
import { PaginationDto } from 'src/users/dto/pagination.dto';

@Injectable()
export class CurriculumsService {
  constructor(
    @InjectRepository(Curriculum)
    private curriculumsRepository: Repository<Curriculum>,
  ) {}

  async findAllByPage(
    paginationDto: PaginationDto,
  ): Promise<{ data: Curriculum[]; total: number }> {
    console.log(paginationDto);
    const { page, limit, sort, order, search } = paginationDto;
    console.log(search);

    const options: FindManyOptions<Curriculum> = {
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

    console.log('Query options:', options); // Debugging line

    const [result, total] =
      await this.curriculumsRepository.findAndCount(options);

    console.log('Result:', result); // Debugging line
    console.log('Total:', total); // Debugging line

    return { data: result, total };
  }

  async create(createCurriculumDto: CreateCurriculumDto): Promise<Curriculum> {
    const curriculum = this.curriculumsRepository.create(createCurriculumDto);
    try {
      await this.curriculumsRepository.save(curriculum);
      const id = curriculum.id;
      return this.curriculumsRepository.findOne({
        where: { id },
        relations: { coordinators: true },
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
        coordinators: true,
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
        coordinators: true,
        plos: true,
        subjects: true,
        branch: true,
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
    curriculum.coordinators = updateCurriculumDto.coordinators;
    curriculum.plos = updateCurriculumDto.plos;
    curriculum.subjects = updateCurriculumDto.subjects;
    // Object.assign(curriculum, updateCurriculumDto); // directly create new delete the first data to new value.

    try {
      await this.curriculumsRepository.save(curriculum);
      return this.curriculumsRepository.findOne({
        where: { id },
        relations: { coordinators: true },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to update Curriculum',
        error.message,
      );
    }
  }

  async addSubject(id: string, subject: Subject): Promise<Curriculum> {
    const curriculum = await this.findOne(id);
    if (!curriculum) {
      throw new NotFoundException(`Curriculum with ID ${id} not found`);
    }
    if (!curriculum.subjects) {
      curriculum.subjects = [];
    }
    curriculum.subjects.push(subject);
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

  async removeSubject(id: string, SubjectId: string): Promise<Curriculum> {
    const curriculum = await this.curriculumsRepository.findOne({
      where: { id },
      relations: { subjects: true },
    });
    if (!curriculum) {
      throw new NotFoundException(`Curriculum with ID ${id} not found`);
    }
    curriculum.subjects = curriculum.subjects.filter(
      (subjects) => subjects.id !== SubjectId,
    );
    try {
      await this.curriculumsRepository.save(curriculum);
      return this.curriculumsRepository.findOne({
        where: { id },
        relations: { subjects: true },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to remove subject in Curriculum',
        error.message,
      );
    }
  }

  async addCoordinator(id: string, users: User[]): Promise<Curriculum> {
    const curriculum = await this.findOne(id);
    if (!curriculum) {
      throw new NotFoundException(`Curriculum with ID ${id} not found`);
    }
    curriculum.coordinators = users;
    try {
      await this.curriculumsRepository.save(curriculum);
      return this.curriculumsRepository.findOne({
        where: { id },
        relations: { coordinators: true },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to update Curriculum',
        error.message,
      );
    }
  }

  async removeCoordinator(
    id: string,
    coordinatorId: string,
  ): Promise<Curriculum> {
    const curriculum = await this.curriculumsRepository.findOne({
      where: { id },
      relations: { coordinators: true },
    });
    if (!curriculum) {
      throw new NotFoundException(`Curriculum with ID ${id} not found`);
    }
    curriculum.coordinators = curriculum.coordinators.filter(
      (coordinator) => coordinator.id !== coordinatorId,
    );
    try {
      await this.curriculumsRepository.save(curriculum);
      return this.curriculumsRepository.findOne({
        where: { id },
        relations: { coordinators: true },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to remove coordinator in Curriculum',
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
