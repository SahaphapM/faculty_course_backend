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
import { Role } from 'src/entities/role.entity';
import { Student } from 'src/entities/student.entity';
import { Teacher } from 'src/entities/teacher.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private UserRepo: Repository<User>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    @InjectRepository(Student)
    private stuRepo: Repository<Student>,
    @InjectRepository(Teacher)
    private teaRepo: Repository<Teacher>,
  ) {}

  async findAllByPage(
    paginationDto: PaginationDto,
  ): Promise<{ data: User[]; total: number }> {
    const { page, limit, sort, order, search, columnId, columnName } =
      paginationDto;

    const queryBuilder = this.UserRepo.createQueryBuilder('user');

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
    const existingUser = await this.UserRepo.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new BadRequestException(
        `User with Email ${createUserDto.email} already exists`,
      );
    }

    const user = this.UserRepo.create(createUserDto);
    return await this.UserRepo.save(user);

    // const user = this.usersRepository.create(createUserDto);
    // user.roles = createUserDto.roles;

    // try {
    //   return await this.usersRepository.save(user);
    // } catch (error) {
    //   throw new BadRequestException('Failed to create user');
    // }
  }

  async findAll(): Promise<User[]> {
    return await this.UserRepo.find({
      relations: { roles: true, student: true, teacher: true },
      select: {
        id: true,
        email: true,
        roles: { id: true, name: true },
        student: { id: true, name: true },
        teacher: { id: true, name: true },
      },
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.UserRepo.findOne({
      where: { id },
      relations: { roles: true },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.UserRepo.findOne({
      where: { email },
    });
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const roles = await Promise.all(
      updateUserDto.roles.map((role) => {
        const res = this.roleRepo.findOneBy({ id: role.id });
        if (!res) {
          throw new NotFoundException(`Role with ID ${role.id} not found`);
        }
        return res;
      }),
    );
    // Update user properties
    Object.assign(user, updateUserDto);
    user.roles = roles;

    if (updateUserDto.studentId) {
      const ent = await this.stuRepo.findOneBy({
        id: updateUserDto.studentId,
      });
      if (!ent) {
        throw new NotFoundException(
          `User with ID ${updateUserDto.studentId} not found`,
        );
      }
      user.student = ent;
    }

    if (updateUserDto.teacherId) {
      const ent = await this.teaRepo.findOneBy({
        id: updateUserDto.teacherId,
      });
      if (!ent) {
        throw new NotFoundException(
          `User with ID ${updateUserDto.teacherId} not found`,
        );
      }
      user.teacher = ent;
    }

    try {
      await this.UserRepo.save(user);
      // const userUpdated = await this.findOne(id);
      // return userUpdated;
    } catch (error) {
      throw new BadRequestException('Failed to update user');
    }
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    try {
      await this.UserRepo.remove(user);
      return `Success Delete ID ${id}`;
    } catch (error) {
      throw new BadRequestException('Failed to remove user');
    }
  }

  async updateHashedRefreshToken(userId: any, hashedRefreshToken: string) {
    return await this.UserRepo.update({ id: userId }, { hashedRefreshToken });
  }
}
