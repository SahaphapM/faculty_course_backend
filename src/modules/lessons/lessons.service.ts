import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLessonDto } from 'src/generated/nestjs-dto/create-lesson.dto';
import { UpdateLessonDto } from 'src/generated/nestjs-dto/update-lesson.dto';
import { LessonFilterDto } from 'src/dto/filters/filter.lesson.dto';
import { createPaginatedData } from 'src/utils/paginated.utils';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  // Find lessons by a list of IDs
  async findByList(lessonListId: number[]) {
    return this.prisma.lesson.findMany({
      where: {
        id: { in: lessonListId },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.lesson.findUnique({ where: { id } });
  }

  // Create a new lesson
  async create(dto: CreateLessonDto) {
    try {
      const lesson = await this.prisma.lesson.create({
        data: {
          ...dto,
        },
      });
      return lesson;
    } catch (error) {
      throw new BadRequestException('Failed to create lesson', error.message);
    }
  }

  // Find all lessons with pagination and search
  async findAll(pag?: LessonFilterDto) {
    const defaultLimit = 10;
    const defaultPage = 1;

    const { thaiName, engName, limit, page, orderBy: order } = pag || {};

    const options: Prisma.lessonFindManyArgs = {
      take: limit || defaultLimit,
      skip: ((page || defaultPage) - 1) * (limit || defaultLimit),
      orderBy: { id: order || 'asc' },
      select: {
        id: true,
        thaiName: true,
        engName: true,
      },
      where: {
        ...(thaiName && { thaiName: { contains: thaiName } }),
        ...(engName && { engName: { contains: engName } }),
      },
    };

    try {
      const [lessons, total] = await Promise.all([
        this.prisma.lesson.findMany(options),
        this.prisma.lesson.count({ where: options.where }),
      ]);

      return createPaginatedData(
        lessons,
        total,
        Number(page || defaultPage),
        Number(limit || defaultLimit),
      );
    } catch (error) {
      console.error('Error fetching lessons:', error);
      throw new InternalServerErrorException('Failed to fetch lessons');
    }
  }

  async update(id: number, dto: UpdateLessonDto) {
    try {
      const lesson = await this.prisma.lesson.update({
        where: { id },
        data: {
          ...dto,
        },
      });
      return lesson;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`lesson with code ${id} not found`);
      }
      throw new BadRequestException('Failed to update lesson');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.prisma.lesson.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`lesson with code ${id} not found`);
      }
      throw new BadRequestException(
        `Failed to remove lesson: ${error.message}`,
      );
    }
  }

  // async filters(curriculumId: number) {
  //   try {
  //     const lessons = await this.prisma.lesson.findMany({
  //       where: {
  //         curriculum: {
  //           id: { equals: curriculumId },
  //         },
  //       },
  //       select: {
  //         id: true,
  //         thaiName: true,
  //         engName: true,
  //       },
  //     });
  //     return lessons;
  //   } catch (error) {
  //     throw new BadRequestException(
  //       `Failed to filter lessons: ${error.message}`,
  //     );
  //   }
  // }
}
