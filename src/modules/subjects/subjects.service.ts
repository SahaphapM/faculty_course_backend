import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service'; // Adjust the import path as needed
import { UpdateCourseSpecDto } from 'src/generated/nestjs-dto/update-courseSpec.dto';
import { CreateCourseSpecDto } from 'src/generated/nestjs-dto/create-courseSpec.dto';

@Injectable()
export class CourseSpecsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async findAll() {
    return await this.prisma.subject.findMany({
      select: {
        curriculum: {
          select: {
            id: true,
            code: true,
            thaiName: true,
            engName: true,
          },
        },
      },
    });
  }

  async findAllByCurriculumId(curriculumId: number) {
    return await this.prisma.subject.findMany({
      where: { curriculumId },
      include: { clo: true },
    });
  }
  async findOne(id: number) {
    const courseSpec = await this.prisma.subject.findUnique({
      where: { id },
    });

    if (!courseSpec) {
      throw new NotFoundException(`CourseSpec with ID ${id} not found`);
    }

    return courseSpec;
  }

  async create(dto: CreateCourseSpecDto) {
    return await this.prisma.subject.create({
      data: {
        ...dto,
        curriculumId: dto.curriculumId,
      },
    });
  }

  async update(id: number, dto: UpdateCourseSpecDto ) {
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
