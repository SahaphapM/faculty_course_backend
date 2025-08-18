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

type MaybeId = number | null | undefined;
type RelationInput = {
  coordinatorId?: MaybeId;
  instructorId?: MaybeId;
  studentId?: MaybeId;
};
type Mode = 'create' | 'update';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * จำกัดให้มีได้ "แค่หนึ่ง" ความสัมพันธ์จากชุด {coordinator, instructor, student}
   * - ถ้ารับค่า id มากกว่าหนึ่ง => throw
   * - ถ้าเป็น update:
   *    - id => connect
   *    - null => disconnect
   *    - ตัวอื่นที่ไม่ได้เลือก => disconnect เสมอ (กันซ้ำซ้อน)
   * - ถ้าเป็น create:
   *    - id => connect
   *    - null/undefined => ไม่ส่งคำสั่ง (Prisma ไม่มีอะไรให้ disconnect ตอนสร้าง)
   */
  private buildExclusiveRelations(
    input: RelationInput,
    mode: Mode = 'update',
  ): Pick<
    Prisma.userCreateInput & Prisma.userUpdateInput,
    'coordinator' | 'instructor' | 'student'
  > {
    const { coordinatorId, instructorId, studentId } = input;

    const provided = [
      ['coordinator', coordinatorId],
      ['instructor', instructorId],
      ['student', studentId],
    ] as const;

    const nonNullCount = provided.filter(
      ([, v]) => v !== null && v !== undefined,
    ).length;
    if (nonNullCount > 1) {
      throw new BadRequestException(
        'Only one relation is allowed: pick exactly one of coordinatorId, instructorId, studentId',
      );
    }

    const toCmd = (val: MaybeId) => {
      if (val === null) return { disconnect: true };
      if (typeof val === 'number') return { connect: { id: val } };
      return undefined;
    };

    const chosenKey = provided.find(([, v]) => typeof v === 'number')?.[0] as
      | 'coordinator'
      | 'instructor'
      | 'student'
      | undefined;

    if (mode === 'update') {
      return {
        coordinator:
          chosenKey === 'coordinator'
            ? toCmd(coordinatorId)
            : coordinatorId === null
              ? { disconnect: true }
              : { disconnect: true },
        instructor:
          chosenKey === 'instructor'
            ? toCmd(instructorId)
            : instructorId === null
              ? { disconnect: true }
              : { disconnect: true },
        student:
          chosenKey === 'student'
            ? toCmd(studentId)
            : studentId === null
              ? { disconnect: true }
              : { disconnect: true },
      };
    }

    // create
    return {
      coordinator: toCmd(coordinatorId),
      instructor: toCmd(instructorId),
      student: toCmd(studentId),
    };
  }

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

    const {
      studentId,
      instructorId,
      coordinatorId,
      ...restCreate // เฉพาะฟิลด์ปกติ (email, name, ฯลฯ) + password
    } = createUserDto;

    const relationData = this.buildExclusiveRelations(
      { studentId, instructorId, coordinatorId },
      'create',
    );

    return await this.prisma.user.create({
      data: {
        ...restCreate,
        password: hashedPassword,
        ...relationData,
      },
      include: {
        student: { select: { id: true, thaiName: true } },
        instructor: { select: { id: true, thaiName: true } },
        coordinator: { select: { id: true, thaiName: true } },
      },
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

    const normalizedSort = sort || 'id';
    const sortField = normalizedSort.startsWith('-')
      ? normalizedSort.slice(1)
      : normalizedSort;
    const sortDirection = normalizedSort.startsWith('-')
      ? 'desc'
      : orderBy?.toLowerCase() === 'desc'
        ? 'desc'
        : 'asc';

    const options: Prisma.userFindManyArgs = {
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { [sortField]: sortDirection },
      where: email ? { email: { contains: email } } : undefined,
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
      include: { student: true, instructor: true, coordinator: true },
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
    const {
      studentId,
      instructorId,
      coordinatorId,
      password,
      ...rest // ฟิลด์ปกติอื่น ๆ
    } = dto as any;

    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const relationData = this.buildExclusiveRelations(
      { studentId, instructorId, coordinatorId },
      'update',
    );

    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    const data: Prisma.userUpdateInput = {
      ...rest,
      ...(hashedPassword && { password: hashedPassword }),
      ...relationData, 
    };

    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        include: {
          student: { select: { id: true, thaiName: true } },
          instructor: { select: { id: true, thaiName: true } },
          coordinator: { select: { id: true, thaiName: true } },
        },
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

    // ใช้ exclusive rule: เลือก student เพียงตัวเดียว และ disconnect ความสัมพันธ์อื่น
    const relationData = this.buildExclusiveRelations(
      { studentId: dto.studentId, instructorId: null, coordinatorId: null },
      'update',
    );

    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          ...relationData,
        },
        include: {
          student: { select: { id: true, thaiName: true } },
          instructor: { select: { id: true, thaiName: true } },
          coordinator: { select: { id: true, thaiName: true } },
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
