import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Teacher } from './entities/teacher.entity';
import { Brackets, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from './dto/pagination.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private teacherRepo: Repository<Teacher>,
  ) {}

  async findAllByPage(
    paginationDto: PaginationDto,
  ): Promise<{ data: Teacher[]; total: number }> {
    const { page, limit, sort, order, search, columnId, columnName } =
      paginationDto;

    const queryBuilder = this.teacherRepo.createQueryBuilder('teacher');

    // Include roles in the query
    queryBuilder.leftJoinAndSelect('teacher.roles', 'roles');

    // Conditionally add joins if columnId and columnName are provided
    if (columnId && columnName === 'branch') {
      // Join teacher with curriculum
      queryBuilder.innerJoin('teacher.curriculums', 'curriculum');
      // Join curriculum with branch
      queryBuilder.innerJoin('curriculum.branch', 'branch');
      // Filter by branchId
      queryBuilder.andWhere('branch.id = :branchId', { branchId: columnId });
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
          qb.where('teacher.firstName LIKE :search', { search: `%${search}%` })
            .orWhere('teacher.lastName LIKE :search', { search: `%${search}%` })
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

  async create(createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    const existingTeacher = await this.teacherRepo.findOne({
      where: { email: createTeacherDto.email },
    });
    if (existingTeacher) {
      throw new BadRequestException(
        `Teacher with Email ${createTeacherDto.email} already exists`,
      );
    }

    const teacher = this.teacherRepo.create(createTeacherDto);
    return await this.teacherRepo.save(teacher);

    // const teacher = this.teachersRepository.create(createTeacherDto);
    // teacher.roles = createTeacherDto.roles;

    // // Hashing password
    // const saltOrRounds = 10;
    // teacher.password = await bcrypt.hash(createTeacherDto.password, saltOrRounds);

    // try {
    //   return await this.teachersRepository.save(teacher);
    // } catch (error) {
    //   throw new BadRequestException('Failed to create teacher');
    // }
  }

  async findAll(): Promise<Teacher[]> {
    return await this.teacherRepo.find({});
  }

  async findOne(id: string): Promise<Teacher> {
    const teacher = await this.teacherRepo.findOne({
      where: { id },
    });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }
    return teacher;
  }

  async findByEmail(email: string): Promise<Teacher> {
    const teacher = await this.teacherRepo.findOne({
      where: { email },
    });
    return teacher;
  }

  async update(
    id: string,
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
      await this.teacherRepo.save(teacher);
      const teacherUpdated = await this.findOne(id);
      return teacherUpdated;
    } catch (error) {
      throw new BadRequestException('Failed to update teacher');
    }
  }

  async remove(id: string) {
    const teacher = await this.findOne(id);
    console.log(teacher);
    try {
      await this.teacherRepo.remove(teacher);
      return `Success Delete ID ${id}`;
    } catch (error) {
      throw new BadRequestException('Failed to remove teacher');
    }
  }

  async updateHashedRefreshToken(teacherId: any, hashedRefreshToken: string) {
    return await this.teacherRepo.update(
      { id: teacherId },
      { hashedRefreshToken },
    );
  }
}
