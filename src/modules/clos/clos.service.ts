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

@Injectable()
export class ClosService {
  constructor(
    @InjectRepository(Clo)
    private closRepository: Repository<Clo>,
  ) {}

  async create(createCloDto: CreateCloDto): Promise<Clo> {
    console.log(createCloDto);

    const clo = this.closRepository.create(createCloDto);
    try {
      return await this.closRepository.save(clo);
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
      relations: { subject: true, plo: true },
    };

    if (search) {
      options.where = [
        { id: Like(`%${search}%`) },
        { name: Like(`%${search}%`) },
        { description: Like(`%${search}%`) },
        { subject: Like(`%${search}%`) },
        { plo: Like(`%${search}%`) },
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
      relations: { subject: true, plo: true },
    });
  }

  async findOne(id: string): Promise<Clo> {
    const clo = await this.closRepository.findOne({
      where: { id },
      relations: { subject: true, plo: true },
    });
    if (!clo) {
      throw new NotFoundException(`CLO with id ${id} not found`);
    }
    return clo;
  }

  async update(id: string, updateCloDto: UpdateCloDto): Promise<Clo> {
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

  async remove(id: string): Promise<void> {
    const clo = await this.findOne(id); // Ensure the CLO exists
    try {
      await this.closRepository.remove(clo);
    } catch (error) {
      throw new BadRequestException('Failed to remove CLO');
    }
  }
}
