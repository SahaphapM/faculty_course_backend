import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/dto/pagination.dto';
import { CreateSubjectDto } from 'src/generated/nestjs-dto/create-subject.dto';
import { UpdateSubjectDto } from 'src/generated/nestjs-dto/update-subject.dto';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  // Find subjects by a list of IDs
  async findByList(subjectListId: number[]) {
    return this.prisma.subject.findMany({
      where: {
        id: { in: subjectListId },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.lesson.findUnique({ where: { id } });
  }

  // Create a new subject
  async create(dto: CreateSubjectDto) {
    try {
      const subject = await this.prisma.subject.create({
        data: {
          ...dto,
        },
      });
      return subject;
    } catch (error) {
      throw new BadRequestException('Failed to create subject', error.message);
    }
  }

  // Find all subjects with pagination and search
  async findAll(pag?: PaginationDto) {
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
      if (pag) {
        const [subjects, total] = await Promise.all([
          this.prisma.lesson.findMany(options),
          this.prisma.lesson.count({ where: options.where }),
        ]);
        return { data: subjects, total };
      } else {
        return await this.prisma.lesson.findMany(options);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw new InternalServerErrorException('Failed to fetch subjects');
    }
  }

  async update(id: number, dto: UpdateSubjectDto) {
    try {
      const subject = await this.prisma.subject.update({
        where: { id },
        data: {
          ...dto,
        },
      });
      return subject;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Subject with code ${id} not found`);
      }
      throw new BadRequestException('Failed to update subject');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      // Delete the subject
      await this.prisma.subject.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Subject with code ${id} not found`);
      }
      throw new BadRequestException(
        `Failed to remove subject: ${error.message}`,
      );
    }
  }

  // Filter subjects by curriculum ID
  async filters(curriculumId: number) {
    try {
      const subjects = await this.prisma.subject.findMany({
        where: {
          curriculum: {
            id: { equals: curriculumId },
          },
        },
        select: {
          id: true,
          thaiName: true,
          engName: true,
        },
      });
      return subjects;
    } catch (error) {
      throw new BadRequestException(
        `Failed to filter subjects: ${error.message}`,
      );
    }
  }
}
