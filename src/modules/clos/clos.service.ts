import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { clo, Prisma } from 'prisma/prisma-client';
import { UpdateCloDto } from 'src/generated/nestjs-dto/update-clo.dto';
import { CreateCloDto } from 'src/generated/nestjs-dto/create-clo.dto';
import { CloFilterDto } from 'src/dto/filters/filter.clo.dto';
import { createPaginatedData } from 'src/utils/paginated.utils';
@Injectable()
export class ClosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCloDto) {
    try {
      return await this.prisma.clo.create({
        data: {
          name: dto.name,
          thaiDescription: dto.thaiDescription,
          engDescription: dto.engDescription,
          ...(dto.subjectId
            ? { subject: { connect: { id: dto.subjectId } } }
            : {}),
          ...(dto.ploId ? { plo: { connect: { id: dto.ploId } } } : {}),
          ...(dto.skillId ? { skill: { connect: { id: dto.skillId } } } : {}),
          expectSkillLevel: dto.expectSkillLevel,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create CLO: ${error.message}`,
      );
    }
  }

  async findAll(pag?: CloFilterDto) {
    const { subjectId, page = 1, limit = 10 } = pag || {};

    const whereCondition: Prisma.cloWhereInput = subjectId
      ? { subjectId: Number(subjectId) }
      : {};

    const options: Prisma.cloFindManyArgs = {
      include: { skill: true, plo: true },
      where: whereCondition,
      take: limit,
      skip: (page - 1) * limit,
    };

    try {
      const [data, total] = await Promise.all([
        this.prisma.clo.findMany(options),
        this.prisma.clo.count({ where: whereCondition }),
      ]);

      return createPaginatedData(data, total, Number(page), Number(limit));
    } catch (error) {
      console.error(`Error fetching CLOs: ${error.message}`);
      throw new InternalServerErrorException('Failed to retrieve data');
    }
  }

  async findOne(id: number): Promise<clo> {
    try {
      const clo = await this.prisma.clo.findUnique({
        where: { id },
        include: { skill: true, plo: true },
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

  async update(id: number, updateCloDto: UpdateCloDto) {
    await this.findOne(id); // Ensure the CLO exists

    try {
      const clo = await this.prisma.clo.update({
        where: { id },
        data: updateCloDto,
      });
      return clo;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update CLO: ${error.message}`,
      );
    }
  }

  async remove(id: number) {
    const clo = await this.findOne(id);
    if (!clo) {
      throw new NotFoundException(`CLO with ID ${id} not found`);
    }

    try {
      const clo = await this.prisma.clo.delete({ where: { id } });
      return clo;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete CLO: ${error.message}`,
      );
    }
  }
}
