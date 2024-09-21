import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Brackets, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAllByPage(
    paginationDto: PaginationDto,
  ): Promise<{ data: User[]; total: number }> {
    const { page, limit, sort, order, search, columnId, columnName } =
      paginationDto;

    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    // Include roles in the query
    queryBuilder.leftJoinAndSelect('user.roles', 'roles');

    // Conditionally add joins if columnId and columnName are provided
    if (columnId && columnName === 'branch') {
      // Join user with curriculum
      queryBuilder.innerJoin('user.curriculums', 'curriculum');
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
          qb.where('user.firstName LIKE :search', { search: `%${search}%` })
            .orWhere('user.lastName LIKE :search', { search: `%${search}%` })
            .orWhere('user.email LIKE :search', { search: `%${search}%` });
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
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser === undefined) {
      throw new BadRequestException(
        `User with Email ${createUserDto.email} already exists`,
      );
    }

    const user = this.usersRepository.create(createUserDto);
    user.roles = createUserDto.roles;

    // Hashing password
    const saltOrRounds = 10;
    user.password = await bcrypt.hash(createUserDto.password, saltOrRounds);

    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      throw new BadRequestException('Failed to create user');
    }
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({
      relations: { roles: true },
      select: [
        'id',
        'email',
        'firstName',
        'middleName',
        'lastName',
        'gender',
        'phone',
      ],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: { roles: true },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'firstName',
        'middleName',
        'lastName',
        'gender',
        'phone',
      ],
    });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    // Update user properties
    Object.assign(user, updateUserDto);
    user.roles = updateUserDto.roles;

    try {
      await this.usersRepository.save(user);
      const userUpdated = await this.findOne(id);
      return userUpdated;
    } catch (error) {
      throw new BadRequestException('Failed to update user');
    }
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    console.log(user);
    try {
      await this.usersRepository.remove(user);
      return `Success Delete ID ${id}`;
    } catch (error) {
      throw new BadRequestException('Failed to remove user');
    }
  }
}
