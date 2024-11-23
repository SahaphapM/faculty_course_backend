import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/dto/pagination.dto';
import { CreateUserDto } from 'src/dto/user/create-user.dto';
import { UpdateUserDto } from 'src/dto/user/update-user.dto';
import { Student } from 'src/entities/student.entity';
import { Instructor } from 'src/entities/instructor.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Student)
    private stuRepo: Repository<Student>,
    @InjectRepository(Instructor)
    private teaRepo: Repository<Instructor>,
  ) { }

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
    const defaultLimit = 10;
    const defaultPage = 1;

    const options: FindManyOptions<User> = {
      relationLoadStrategy: 'query',
      relations: { student: true, teacher: true },
      select: {
        id: true,
        email: true,
        role: true,
        student: { id: true, name: true },
        teacher: { id: true, name: true },
      },
    };
    try {
      if (pag) {
        const { search, limit, page, order } = pag;

        options.take = limit || defaultLimit;
        options.skip = ((page || defaultPage) - 1) * (limit || defaultLimit);
        options.order = { id: order || 'ASC' };

        if (search) {
          options.where = [
            // { id: Like(`%${search}%`) },
            { email: Like(`%${search}%`) }
          ];
        }
        return await this.userRepo.findAndCount(options);
      } else {
        return await this.userRepo.find(options);
      }
    } catch (error) {
      // Log the error for debugging
      console.error('Error fetching users:', error);
      throw new InternalServerErrorException('Failed to fetch users');
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
