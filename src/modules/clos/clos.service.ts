import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PaginationDto } from 'src/dto/pagination.dto';
import { PrismaService } from 'prisma/prisma.service';
import { clo } from 'prisma/prisma-client';
import { CloDto } from 'src/generated/nestjs-dto/clo.dto';
import { UpdateCloDto } from 'src/generated/nestjs-dto/update-clo.dto';
@Injectable()
export class ClosService {
  constructor(private prisma: PrismaService) {}

  async create(createCloDto: CloDto): Promise<clo> {
    const { courseSpec, plo, skill } = await this.findDependency(createCloDto);

    try {
      return await this.prisma.clo.create({
        data: {
          ...createCloDto,
          courseSpecId: courseSpec.id,
          ploId: plo.id,
          skills: { connect: { id: skill.id } },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create CLO: ${error.message}`,
      );
    }
  }

  async findAllByPage(
    paginationDto: PaginationDto,
  ): Promise<{ data: clo[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sort = 'id',
      order = 'asc',
      search,
    } = paginationDto;

    const options: any = {
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { [sort]: order },
      include: { skill: true, plo: true },
    };

    if (search) {
      options.where = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { thaiDescription: { contains: search, mode: 'insensitive' } },
          { engDescription: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    try {
      const [data, total] = await Promise.all([
        this.prisma.clo.findMany(options),
        this.prisma.clo.count({ where: options.where }),
      ]);
      return { data, total };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to retrieve data: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<clo[]> {
    try {
      return await this.prisma.clo.findMany({
        include: { skills: true, plo: true },
      });
    } catch (error) {
      throw new NotFoundException('Failed to fetch CLOs: ' + error.message);
    }
  }

  async findAllByCourseSpec(courseSpecId: number): Promise<clo[]> {
    try {
      return await this.prisma.clo.findMany({
        where: { courseSpecId },
      });
    } catch (error) {
      throw new NotFoundException(
        `CourseSpec with id ${courseSpecId} not found: ${error.message}`,
      );
    }
  }

  async findOne(id: number): Promise<clo> {
    try {
      const clo = await this.prisma.clo.findUnique({
        where: { id },
        include: { skills: true, plo: true },
      });

      if (!clo) {
        throw new NotFoundException(`CLO with ID ${id} not found`);
      }

      return clo;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to retrieve CLO: ${error.message}`,
      );
    }
  }

  async update(id: number, updateCloDto: UpdateCloDto): Promise<clo> {
    await this.findOne(id); // Ensure the CLO exists

    try {
      return await this.prisma.clo.update({
        where: { id },
        data: updateCloDto,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update CLO: ${error.message}`,
      );
    }
  }

  async remove(id: number): Promise<void> {
    const clo = await this.findOne(id);
    if (!clo) {
      throw new NotFoundException(`CLO with ID ${id} not found`);
    }

    try {
      await this.prisma.clo.delete({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete CLO: ${error.message}`,
      );
    }
  }

  // Helper function to find dependencies
  async findDependency(createCloDto: CloDto) {
    const courseSpec = await this.prisma.course_spec.findUnique({
      where: { id: createCloDto.courseSpecId },
    });

    if (!courseSpec) {
      throw new NotFoundException(
        `CourseSpec with id ${createCloDto.courseSpecId} not found`,
      );
    }

    const skill = await this.prisma.skill.findUnique({
      where: { id: createCloDto },
    });

    if (!skill) {
      throw new NotFoundException(
        `Skill with id ${createCloDto.skillId} not found`,
      );
    }

    const plo = await this.prisma.plo.findUnique({
      where: { id: createCloDto.ploId },
    });

    if (!plo) {
      throw new NotFoundException(
        `PLO with id ${createCloDto.ploId} not found`,
      );
    }

    return { courseSpec, skill, plo };
  }
}
