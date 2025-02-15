import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubjectDto } from 'src/generated/nestjs-dto/create-subject.dto';
import { UpdateSubjectDto } from 'src/generated/nestjs-dto/update-subject.dto';
import { PrismaService } from 'src/prisma/prisma.service'; // Adjust the import path as needed

@Injectable()
export class SubjectService {
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
      include: { clos: true },
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

  async create(dto: CreateSubjectDto) {
    return await this.prisma.subject.create({
      data: {
        ...dto,
        curriculumId: dto.curriculumId,
      },
    });
  }

  async update(id: number, dto: UpdateSubjectDto ) {
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
