import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Teacher } from '../../entities/teacher.entity';
import { Brackets, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from '../../dto/pagination.dto';
import { CreateTeacherDto } from '../../dto/teacher/create-teacher.dto';
import { UpdateTeacherDto } from '../../dto/teacher/update-teacher.dto';
import { Curriculum } from 'src/entities/curriculum.entity';
import { Branch } from 'src/entities/branch.entity';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Branch)
    private braRepo: Repository<Branch>,
    @InjectRepository(Curriculum)
    private curRepo: Repository<Curriculum>,
    @InjectRepository(Teacher)
    private teaRepo: Repository<Teacher>,
  ) {}

  async findAllByPage(
    paginationDto: PaginationDto,
  ): Promise<{ data: Teacher[]; total: number }> {
    const { page, limit, sort, order, search, columnId, columnName } =
      paginationDto;

    const queryBuilder = this.teaRepo.createQueryBuilder('teacher');

    // Conditionally add joins if columnId and columnName are provided
    if (columnId && columnName === 'branch') {
      // Join teacher with curriculum
      queryBuilder.innerJoin('teacher.curriculums', 'curriculum');
      // Join curriculum with branch
      queryBuilder.innerJoin('curriculum.branchId', 'branchId');
      // Filter by branchId
      queryBuilder.andWhere('branchId = :branchId', { branchId: columnId });
    } else if (columnId && columnName === 'curriculum') {
      queryBuilder.innerJoinAndSelect(
        `teacher.${columnName}s`,
        `${columnName}`,
      );
      queryBuilder.andWhere(`${columnName}.id = :columnId`, {
        columnId,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('teacher.name LIKE :search', { search: `%${search}%` })
            .orWhere('teacher.engName LIKE :search', { search: `%${search}%` })
            .orWhere('teacher.email LIKE :search', { search: `%${search}%` });
        }),
      );
    }

    if (sort && order) {
      queryBuilder.orderBy(`teacher.${sort}`, order);
    }

    // Log the generated SQL query and its parameters
    // console.log('Generated SQL:', queryBuilder.getSql());
    // console.log('Query Parameters:', queryBuilder.getParameters());

    const [data, total] = await queryBuilder
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();

    // console.log('PaginationDto:', paginationDto);
    // console.log('Data:', data);
    // console.log('Total:', total);

    return { data, total };
  }

  async create(dto: CreateTeacherDto) {
    const { branchId, curriculumsId, ...rest } = dto;

    // Check if the teacher with this email already exists
    const existingTeacher = await this.teaRepo.findOne({
      where: { email: rest.email },
    });
    if (existingTeacher) {
      throw new BadRequestException(
        `Teacher with Email ${rest.email} already exists`,
      );
    }

    let existBranch = null;
    let existCurriculums = [];

    // Check for branch if branchId is provided
    if (branchId) {
      existBranch = await this.braRepo.findOne({ where: { id: branchId } });
      if (!existBranch) {
        throw new BadRequestException(
          `Branch with ID ${branchId} does not exist`,
        );
      }
    }

    // Check for curriculums if curriculumsId is provided
    if (curriculumsId && curriculumsId.length > 0) {
      existCurriculums = await this.curRepo.findBy({ id: In(curriculumsId) });
      if (existCurriculums.length !== curriculumsId.length) {
        throw new BadRequestException(
          `Curriculum with ID ${curriculumsId
            .filter((id) => !existCurriculums.find((c) => c.id === id))
            .join(', ')} does not exist`,
        );
      }
    }

    // Create teacher instance, conditionally adding optional fields
    const teacher = this.teaRepo.create({
      ...rest,
      specialists: dto.specialists
        ? dto.specialists.map((s) => s).join(', ')
        : '-',
      socials: dto.socials ? JSON.stringify(dto.socials) : '-',
      curriculums: existCurriculums.length > 0 ? existCurriculums : undefined,
      branch: existBranch ?? undefined,
    });

    return await this.teaRepo.save(teacher);
  }

  async findAll(): Promise<Teacher[]> {
    return await this.teaRepo.find();
  }

  async findOne(id: number): Promise<Teacher> {
    const teacher = await this.teaRepo.findOne({
      where: { id },
    });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }
    return teacher;
  }

  async findByEmail(email: string): Promise<Teacher> {
    const teacher = await this.teaRepo.findOne({
      where: { email },
    });
    return teacher;
  }

  async update(
    id: number,
    updateTeacherDto: UpdateTeacherDto,
  ): Promise<Teacher> {
    const teacher = await this.findOne(id);

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }
    // Update teacher properties
    Object.assign(teacher, updateTeacherDto);
    // teacher.roles = updateTeacherDto.roles;

    try {
      await this.teaRepo.save(teacher);
      const teacherUpdated = await this.findOne(id);
      return teacherUpdated;
    } catch (error) {
      throw new BadRequestException('Failed to update teacher');
    }
  }

  async remove(id: number) {
    const teacher = await this.findOne(id);
    try {
      await this.teaRepo.remove(teacher);
      return `Success Delete ID ${id}`;
    } catch (error) {
      throw new BadRequestException('Failed to remove teacher');
    }
  }
}
