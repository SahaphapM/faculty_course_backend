import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FilterParams } from 'src/dto/filter-params.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { clo, Prisma } from 'prisma/prisma-client';
import { UpdateCloDto } from 'src/generated/nestjs-dto/update-clo.dto';
import { CreateCloDto } from 'src/generated/nestjs-dto/create-clo.dto';
@Injectable()
export class ClosService {
  constructor(private prisma: PrismaService) {}

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
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create CLO: ${error.message}`,
      );
    }
  }

  async findAll(pag?: FilterParams): Promise<{ data: clo[]; total: number }> {
    const subjectId = pag?.subjectId;

    // Prisma query options
    const whereCondition: Prisma.cloWhereInput = {
      subjectId,
    };

    const options: Prisma.cloFindManyArgs = {
      include: { skills: true, plo: true },
      where: whereCondition,
    };

    try {
      const [data, total] = await Promise.all([
        this.prisma.clo.findMany(options),
        this.prisma.clo.count({ where: whereCondition }),
      ]);

      return { data, total };
    } catch (error) {
      console.error(`Error fetching CLOs: ${error.message}`);
      throw new InternalServerErrorException('Failed to retrieve data');
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
}
