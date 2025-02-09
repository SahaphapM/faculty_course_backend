import {
  BadRequestException,
  Injectable,
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
      const savedClo = await this.closRepository.save(clo);
      console.log(savedClo);
      return savedClo;
    } catch (error) {
      throw new BadRequestException('Failed to create CLO');
    }
  }

  async findAllByPage(
    paginationDto: PaginationDto,
  ): Promise<{ data: Clo[]; total: number }> {
    // console.log(paginationDto);
    const { page, limit, sort, order, search } = paginationDto;
    // console.log(search);

    const options: FindManyOptions<Clo> = {
      take: limit,
      skip: (page - 1) * limit,
      order: sort ? { [sort]: order } : {},
      relations: { skill: true, plo: true },
    };

    if (search) {
      options.where = [
        { name: Like(`%${search}%`) },
        { description: Like(`%${search}%`) },
      ];
    }

    // console.log('Query options:', options); // Debugging line

    const [result, total] = await this.closRepository.findAndCount(options);

    // console.log('Result:', result); // Debugging line
    // console.log('Total:', total); // Debugging line

    return { data: result, total };
  }

  async findAll(): Promise<Clo[]> {
    return await this.closRepository.find({
      relations: { skill: true, plo: true },
    });
  }

  async findOne(id: number): Promise<Clo> {
    const clo = await this.closRepository.findOne({
      where: { id },
      relations: { skill: true, plo: true },
    });
    if (!clo) {
      throw new NotFoundException(`CLO with id ${id} not found`);
    }
    return clo;
  }

  async update(id: number, updateCloDto: UpdateCloDto): Promise<Clo> {
    await this.findOne(id); // Ensure the CLO exists
    console.log(updateCloDto);

    const clo = await this.closRepository.preload({
      id,
      ...updateCloDto,
    });

    if (!clo) {
      throw new NotFoundException(`CLO with id ${id} not found`);
    }

    try {
      return await this.closRepository.save(clo);
    } catch (error) {
      throw new BadRequestException('Failed to update CLO');
    }
  }

  async remove(id: number): Promise<void> {
    const clo = await this.findOne(id); // Ensure the CLO exists
    try {
      await this.closRepository.remove(clo);
    } catch (error) {
      throw new BadRequestException('Failed to remove CLO');
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
