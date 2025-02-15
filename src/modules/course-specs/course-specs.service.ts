import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service'; // Adjust the import path as needed
import { subject } from '@prisma/client'; // Import Prisma-generated types
import { CreateCourseSpecDto } from 'src/dto/course-specs/create-course-spec.dto';
import { UpdateCourseSpecDto } from 'src/dto/course-specs/update-course-spec.dto';

@Injectable()
export class CourseSpecsService {
  constructor(private prisma: PrismaService) {}

  async createCourseSpec(createCourseSpecDto: CreateCourseSpecDto) {
    // Check if the curriculum exists
    const curriculum = await this.prisma.curriculum.findUnique({
      where: { id: createCourseSpecDto.curriculumId },
    });
    if (!curriculum) {
      throw new NotFoundException(
        `Curriculum with ID ${createCourseSpecDto.curriculumId} not found`,
      );
    }

    // Check if the subject exists, otherwise create a new one
    let subject = await this.prisma.subject.findUnique({
      where: { code: createCourseSpecDto.subject.code },
    });

    if (!subject) {
      subject = await this.createSubject(
        createCourseSpecDto.curriculumId,
        createCourseSpecDto,
      );
    }

    // Create the course specification
    return await this.prisma.course_spec.create({
      data: {
        ...createCourseSpecDto,
        subjectId: subject.id,
        curriculumId: curriculum.id,
      },
    });
  }

  async findAll() {
    return await this.prisma.course_spec.findMany({
      include: { curriculum: true, subject: true },
    });
  }

  async findAllByCurriculum(curriculumId: number) {
    return await this.prisma.course_spec.findMany({
      where: { curriculumId },
      include: { subject: true, clo: true },
    });
  }

  async findOne(id: number) {
    const courseSpec = await this.prisma.course_spec.findUnique({
      where: { id },
    });

    if (!courseSpec) {
      throw new NotFoundException(`CourseSpec with ID ${id} not found`);
    }

    return courseSpec;
  }

  async createByCurrId(id: number, dto: CreateCourseSpecDto) {
    const curriculum = await this.prisma.curriculum.findUnique({
      where: { id },
    });

    if (!curriculum) {
      throw new NotFoundException(`Curriculum with ID ${id} not found`);
    }

    return await this.prisma.course_spec.create({
      data: {
        ...dto,
        curriculum: { connect: { id } },
      },
    });
  }

  async updateByCurrId(id: number, dto: UpdateCourseSpecDto) {
  const curriculum = await this.prisma.curriculum.findUnique({
      where: { id },
    });

    if (!curriculum) {
      throw new NotFoundException(`Curriculum with ID ${id} not found`);
    }

    if (!dto.id) {
      throw new NotFoundException(`CourseSpec ID is required for update`);
    }

    return await this.prisma.course_spec.update({
      where: { id: dto.id },
      data: {
        ...dto,
        curriculum: { connect: { id } },
      },
    });
  }

  async update(id: number, updateCourseSpecDto: UpdateCourseSpecDto) {
    const courseSpec = await this.findOne(id);

    let subject: subject;

    // Check if the subject code has changed
    if (courseSpec.subjectId !== updateCourseSpecDto.subject.id) {
      subject = await this.prisma.subject.findUnique({
        where: { code: updateCourseSpecDto.subject.code },
      });

      if (!subject) {
        subject = await this.createSubject(
          updateCourseSpecDto.curriculumId,
          updateCourseSpecDto,
        );
      }
    }

    // Update the course specification
    return await this.prisma.course_spec.update({
      where: { id },
      data: {
        ...updateCourseSpecDto,
        subject: { connect: { id: subject?.id || courseSpec.subject.id } },
      },
    });
  }

  async remove(id: number) {
    return await this.prisma.course_spec.delete({
      where: { id },
    });
  }

  async createSubject(
    curriculumId: number,
    createCourseSpecDto: Partial<CreateCourseSpecDto>,
  ) {
    const curriculum = await this.prisma.curriculum.findUnique({
      where: { id: curriculumId },
    });

    if (!curriculum) {
      throw new NotFoundException(
        `Curriculum with ID ${curriculumId} not found`,
      );
    }

    // Create a new subject and link it to the curriculum
    return await this.prisma.subject.create({
      data: {
        code: createCourseSpecDto.subject.code,
        curriculum: { connect: { id: curriculumId } },
      },
    });
  }
}
