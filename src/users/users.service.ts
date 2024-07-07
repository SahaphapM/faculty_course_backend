import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
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
    const { page = 1, limit = 10 } = paginationDto;
    const [result, total] = await this.usersRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
    });
    return { data: result, total };
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
        'googleId',
        'roles',
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
