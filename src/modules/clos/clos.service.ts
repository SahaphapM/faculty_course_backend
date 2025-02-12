import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Clo } from '../../entities/clo.entity';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { CreateCloDto } from 'src/dto/clo/create-clo.dto';
import { UpdateCloDto } from 'src/dto/clo/update-clo.dto';
import { PaginationDto } from 'src/dto/pagination.dto';
import { Plo } from 'src/entities/plo.entity';
import { CourseSpec } from 'src/entities/course-spec.entity';
import { Skill } from 'src/entities/skill.entity';

@Injectable()
export class ClosService {
  constructor(
    @InjectRepository(Clo)
    private closRepository: Repository<Clo>,

    @InjectRepository(CourseSpec)
    private courseSpecsRepository: Repository<CourseSpec>,

    @InjectRepository(Plo)
    private plosRepository: Repository<Plo>,

    @InjectRepository(Skill)
    private skillsRepository: Repository<Skill>,
  ) {}

  async create(createCloDto: CreateCloDto): Promise<Clo> {
    const { courseSpec, plo, skill } = await this.findDependencys(createCloDto);

    const clo = this.closRepository.create({
      ...createCloDto,
      courseSpec,
      plo,
      skill,
    });

    try {
      return await this.closRepository.save(clo);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create CLO: ${error.message}`,
      );
    }
  }

  async findAllByPage(
    paginationDto: PaginationDto,
  ): Promise<{ data: Clo[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sort = 'id',
      order = 'ASC',
      search,
    } = paginationDto;

    const options: FindManyOptions<Clo> = {
      take: limit,
      skip: (page - 1) * limit,
      order: { [sort]: order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC' },
      relations: { skill: true, plo: true },
    };

    if (search) {
      options.where = [
        { name: Like(`%${search}%`) },
        { thaiDescription: Like(`%${search}%`) },
        { engDescription: Like(`%${search}%`) },
      ];
    }

    try {
      const [result, total] = await this.closRepository.findAndCount(options);
      return { data: result, total };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to retrieve data: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<Clo[]> {
    try {
      return await this.closRepository.find({
        relations: { skill: true, plo: true },
      });
    } catch (error) {
      throw new NotFoundException('Failed to fetch CLOs' + error.message);
    }
  }

  async findAllByCoursSpec(coursSpecId: number): Promise<Clo[]> {
    try {
      return await this.closRepository.find({
        where: { courseSpec: { id: coursSpecId } },
      });
    } catch (error) {
      throw new NotFoundException(
        `CourseSpec with id ${coursSpecId} not found ` + error.message,
      );
    }
  }

  async findOne(id: number): Promise<Clo> {
    try {
      const clo = await this.closRepository.findOne({
        where: { id },
        relations: { skill: true, plo: true },
      });

      if (!clo) {
        throw new NotFoundException(`CLO with ID ${id} not found`);
      }

      return clo;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to retrieve CLO: ${error.message}`,
      );
    }
  }

  async update(id: number, updateCloDto: UpdateCloDto): Promise<Clo> {
    await this.findOne(id); // Ensure the CLO exists

    const clo = await this.closRepository.preload({
      id,
      ...updateCloDto,
    });

    if (!clo) {
      throw new NotFoundException(`CLO with ID ${id} not found`);
    }

    try {
      return await this.closRepository.save(clo);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update CLO: ${error.message}`,
      );
    }
  }

  async remove(id: number): Promise<void> {
    const clo = await this.findOne(id);
    if (!clo) {
      throw new NotFoundException(`CLO with ID ${id} not found`);
    }

    try {
      await this.closRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete CLO: ${error.message}`,
      );
    }
  }

  //////////////////////////////////// function /////////////////////////////////////
  async findDependencys(createCloDto: CreateCloDto) {
    const courseSpec = await this.courseSpecsRepository.findOne({
      where: { id: createCloDto.courseSpecId },
    });

    if (!courseSpec) {
      throw new NotFoundException(
        `CourseSpec with id ${createCloDto.courseSpecId} not found`,
      );
    }

    const skill = await this.skillsRepository.findOne({
      where: { id: createCloDto.skillId },
    });

    if (!skill) {
      throw new NotFoundException(
        `Skill with id ${createCloDto.skillId} not found`,
      );
    }

    const plo = await this.plosRepository.findOne({
      where: { id: createCloDto.ploId },
    });

    if (!plo) {
      throw new NotFoundException(
        `PLO with id ${createCloDto.ploId} not found`,
      );
    }

    return { courseSpec, skill, plo };
  }
}
