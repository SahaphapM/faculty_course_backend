import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PaginationDto } from 'src/dto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/generated/nestjs-dto/create-user.dto';
import { UpdateUserDto } from 'src/generated/nestjs-dto/update-user.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException(
        `User with Email ${createUserDto.email} already exists`,
      );
    }

    return await this.prisma.user.create({ data: createUserDto });
  }

  async findAll(pag?: PaginationDto) {
    const {
      page = 1,
      limit = 10,
      sort = 'id',
      orderBy = 'asc',
      email
    } = pag;

    const options: Prisma.userFindManyArgs = {
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { [sort]: orderBy },
      where: {
        ...(email && { email: { contains: email } }),
      },
      include: {
        student: { select: { id: true, thaiName: true } },
        instructor: { select: { id: true, thaiName: true } },
      },
    };

    try {
      const [users, total] = await Promise.all([
        this.prisma.user.findMany(options),
        this.prisma.user.count({ where: options.where }),
      ]);

      return { data: users, total };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { student: true, instructor: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const data: Prisma.userUpdateInput = {
      ...dto,
      student: {
        connect: { id: dto.studentId },
      },
      instructor: {
        connect: { id: dto.instructorId },
      },
    };

    try {
      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new BadRequestException('Failed to update user');
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      await this.prisma.user.delete({ where: { id } });
      return `Success Delete ID ${id}`;
    } catch (error) {
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
