import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/generated/nestjs-dto/create-user.dto';
import { UpdateUserDto } from 'src/generated/nestjs-dto/update-user.dto';
import { Prisma } from '@prisma/client';
import * as bcrypt from '@node-rs/bcrypt';
import { UserFilterDto } from 'src/dto/filters/filter.user.dto';
import { UpdateUserStudentDto } from 'src/dto/update-user-student.dto';
import { createPaginatedData } from 'src/utils/paginated.utils';
import { DefaultPaginaitonValue } from 'src/configs/pagination.configs';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException(
        `User with Email ${createUserDto.email} already exists`,
      );
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return await this.prisma.user.create({
      data: { ...createUserDto, password: hashedPassword },
    });
  }

  async findAll(pag?: UserFilterDto) {
    const {
      page = DefaultPaginaitonValue.page,
      limit = DefaultPaginaitonValue.limit,
      sort = DefaultPaginaitonValue.sortBy,
      orderBy = DefaultPaginaitonValue.orderBy,
      email,
    } = pag || {};

    // Normalize sort: allow leading '-' for descending (e.g. '-id')
    const normalizedSort = sort || 'id';
    const sortField = normalizedSort.startsWith('-')
      ? normalizedSort.slice(1)
      : normalizedSort;
    const sortDirection = normalizedSort.startsWith('-')
      ? 'desc'
      : orderBy?.toLowerCase() === 'desc'
        ? 'desc'
        : 'asc';

    // Prisma query options
    const options: Prisma.userFindManyArgs = {
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { [sortField]: sortDirection },
      where: email ? { email: { contains: email } } : undefined, // Avoids unnecessary `where`
      include: {
        student: { select: { id: true, thaiName: true } },
        instructor: { select: { id: true, thaiName: true } },
        coordinator: { select: { id: true, thaiName: true } },
      },
    };

    try {
      const [users, total] = await Promise.all([
        this.prisma.user.findMany(options),
        this.prisma.user.count({ where: options.where }),
      ]);

      return createPaginatedData(users, total, Number(page), Number(limit));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async findOneById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { student: true, instructor: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string, fields?: Prisma.userSelect) {
    return await this.prisma.user.findUnique({
      where: { email },
      select: fields,
    });
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    let hashedPassword = undefined;
    if (dto.password) {
      hashedPassword = await bcrypt.hash(dto.password, 10);
    }

    const data: Prisma.userUpdateInput = {
      ...dto,
      password: hashedPassword,
      ...(dto.studentId && {
        student: { connect: { id: dto.studentId } },
      }),
      ...(dto.instructorId && {
        instructor: { connect: { id: dto.instructorId } },
      }),
    };

    try {
      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw new BadRequestException('Failed to update user');
    }
  }

  async updateStudentId(id: number, dto: UpdateUserStudentDto) {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          student: { connect: { id: dto.studentId } },
        },
        include: {
          student: { select: { id: true, thaiName: true } },
          instructor: { select: { id: true, thaiName: true } },
        },
      });
    } catch (error) {
      console.error('Error updating user student ID:', error);
      throw new BadRequestException('Failed to update user student ID');
    }
  }

  async remove(id: number) {
    await this.findOneById(id);
    try {
      await this.prisma.user.delete({ where: { id } });
      return `Success Delete ID ${id}`;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new BadRequestException('Failed to remove user');
    }
  }

  async updateHashedRefreshToken(userId: number, hashedRefreshToken: string) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken },
    });
  }
}
