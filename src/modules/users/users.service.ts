import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { Brackets, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/dto/pagination.dto';
import { CreateUserDto } from 'src/dto/user/create-user.dto';
import { UpdateUserDto } from 'src/dto/user/update-user.dto';
import { Student } from 'src/entities/student.entity';
import { Teacher } from 'src/entities/teacher.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Student)
    private stuRepo: Repository<Student>,
    @InjectRepository(Teacher)
    private teaRepo: Repository<Teacher>,
  ) { }

  async findAllByPage(
    paginationDto: PaginationDto,
  ): Promise<{ data: User[]; total: number }> {
    const { page, limit, sort, order, search, columnId, columnName } =
      paginationDto;

    const queryBuilder = this.userRepo.createQueryBuilder('user');

    // Conditionally add joins if columnId and columnName are provided
    if (columnId && columnName === 'branch') {
      // Join curriculum with branch
      queryBuilder.innerJoin('curriculum.branch', 'branch');
      // Filter by branchId
      queryBuilder.andWhere('branch.id = :branchId', { branchId: columnId });
    } else if (columnId && columnName === 'curriculum') {
      queryBuilder.innerJoinAndSelect(`user.${columnName}s`, `${columnName}`);
      queryBuilder.andWhere(`${columnName}.id = :columnId`, {
        columnId,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('user.email LIKE :search', { search: `%${search}%` });
        }),
      );
    }

    if (sort && order) {
      queryBuilder.orderBy(`user.${sort}`, order);
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

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepo.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new BadRequestException(
        `User with Email ${createUserDto.email} already exists`,
      );
    }

    const user = this.userRepo.create(createUserDto);
    return await this.userRepo.save(user);
  }

  async findAll(pag?: PaginationDto) {
    const queryBuilder = this.userRepo.createQueryBuilder('user');

    if (pag?.search) {
      queryBuilder.andWhere('user.id LIKE :search', {
        search: `%${pag.search}%`,
      });
    }

    if (pag?.page && pag?.limit) {
      queryBuilder.take(pag.limit).skip((pag.page - 1) * pag.limit);
    }

    if (pag?.order) {
      queryBuilder.orderBy('user.id', pag.order);
    }

    queryBuilder
      .select('user.id', 'id')
      .addSelect('user.email', 'email')
      .addSelect('user.role', 'role')
      .leftJoinAndSelect('user.student', 'student', 'student.id = user.id')
      .addSelect('student.id', 'studentId')
      .addSelect('student.name', 'studentName')
      .leftJoinAndSelect('user.teacher', 'teacher', 'teacher.id = user.id')
      .addSelect('teacher.id', 'teacherId')
      .addSelect('teacher.name', 'teacherName');

    if (!pag) {
      return await queryBuilder.getMany();
    } else {
      return await queryBuilder.getManyAndCount();
    }
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { email },
    });
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Update user properties
    Object.assign(user, dto);

    if (dto.studentId) {
      const ent = await this.stuRepo.findOneBy({
        id: dto.studentId,
      });
      if (!ent) {
        throw new NotFoundException(
          `User with ID ${dto.studentId} not found`,
        );
      }
      user.student = ent;
    }

    if (dto.teacherId) {
      const ent = await this.teaRepo.findOneBy({
        id: dto.teacherId,
      });
      if (!ent) {
        throw new NotFoundException(
          `User with ID ${dto.teacherId} not found`,
        );
      }
      user.teacher = ent;
    }

    try {
      return await this.userRepo.save(user);
    } catch (error) {
      throw new BadRequestException('Failed to update user');
    }
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    try {
      await this.userRepo.remove(user);
      return `Success Delete ID ${id}`;
    } catch (error) {
      throw new BadRequestException('Failed to remove user');
    }
  }

  async updateHashedRefreshToken(userId: any, hashedRefreshToken: string) {
    return await this.userRepo.update({ id: userId }, { hashedRefreshToken });
  }
}
