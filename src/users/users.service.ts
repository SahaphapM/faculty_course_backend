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
    const { page, limit, sort, order, search, column1, column2 } =
      paginationDto;

    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    // Include roles in the query
    queryBuilder.leftJoinAndSelect('user.roles', 'roles');

    // Conditionally add joins if necessary
    if (column1) {
      queryBuilder
        .innerJoinAndSelect('user.branch', 'branch')
        .innerJoinAndSelect('branch.faculty', 'faculty');
    } else if (column2) {
      queryBuilder.innerJoinAndSelect('user.branch', 'branch');
    }

    // Conditionally add where clauses
    if (column1) {
      queryBuilder.andWhere('faculty.id = :facultyId', { facultyId: column1 });
    }
    if (column2) {
      queryBuilder.andWhere('branch.id = :branchId', { branchId: column2 });
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

    // console.log('Generated SQL:', queryBuilder.getSql()); // Log the SQL query

    const [data, total] = await queryBuilder
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();

    console.log('PaginationDto:', paginationDto);
    console.log('Data:', data);
    console.log('Total:', total);

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
      relations: { roles: true, branch: true, faculty: true },
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
