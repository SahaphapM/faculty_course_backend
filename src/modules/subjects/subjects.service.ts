import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FilterParams } from 'src/dto/filter-params.dto';
import { CreateSubjectDto } from 'src/generated/nestjs-dto/create-subject.dto';
import { UpdateSubjectDto } from 'src/generated/nestjs-dto/update-subject.dto';
import { PrismaService } from 'src/prisma/prisma.service'; // Adjust the import path as needed

@Injectable()
export class SubjectService {
  constructor(private prisma: PrismaService) {}

  async findAll(pag?: FilterParams) {
    const defaultLimit = 10;
    const defaultPage = 1;

    const { thaiName, engName, code, limit, page, orderBy, curriculumCode } =
      pag || {};

    const whereCondition: Prisma.subjectWhereInput = {
      ...(code && { code: code }),
      ...(thaiName && { thaiName: { contains: thaiName } }),
      ...(engName && { engName: { contains: engName } }),
      ...(curriculumCode && {
        curriculums: { some: { curriculum: { code: curriculumCode } } },
      }),
    };

    const includeCondition: Prisma.subjectInclude = { 
      clos: true,
    };

    if (!pag) {
      // No pagination → fetch all
      return this.prisma.subject.findMany({
        where: whereCondition,
        include: includeCondition,
        orderBy: { id: 'asc' }, // Default sorting
      });
    }

    // With pagination
    const options: Prisma.subjectFindManyArgs = {
      take: limit || defaultLimit,
      skip: ((page || defaultPage) - 1) * (limit || defaultLimit),
      orderBy: { id: orderBy || 'asc' },
      include: includeCondition,
      where: whereCondition,
    };

    try {
      const [subject, total] = await Promise.all([
        this.prisma.subject.findMany(options),
        this.prisma.subject.count({ where: whereCondition }),
      ]);
      return { data: subject, total };
    } catch (error) {
      console.error('Error fetching instructors:', error);
      throw new InternalServerErrorException('Failed to fetch instructors');
    }
  }

  async findOne(id: number) {
    const courseSpec = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        clos: true,
      },
    });

    if (!courseSpec) {
      throw new NotFoundException(`CourseSpec with ID ${id} not found`);
    }

    return courseSpec;
  }

  async create(dto: CreateSubjectDto) {
    const subject = await this.prisma.subject.create({
      data: {
        ...dto,
        curriculumId: dto.curriculumId,
      },
    });
    await this.prisma.lesson.create({
      data: {
        thaiName: dto.thaiName,
        engName: dto.engName,
        subjectId: subject.id,
      },
    });

    return subject;
  }

  async update(id: number, dto: UpdateSubjectDto) {
    return await this.prisma.subject.update({
      where: { id: id },
      data: {
        ...dto,
        curriculumId: dto.curriculumId,
      },
    });
  }

  async remove(id: number) {
    return await this.prisma.subject.delete({
      where: { id },
    });
  }
}
