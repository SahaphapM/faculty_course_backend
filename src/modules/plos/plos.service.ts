import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Adjust the import path as needed
import { CreatePloDto } from 'src/generated/nestjs-dto/create-plo.dto';
import { UpdatePloDto } from 'src/generated/nestjs-dto/update-plo.dto';
import { FilterParams } from 'src/dto/filter-params.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PloService {
  constructor(private prisma: PrismaService) {}

  // Create a new PLO
  async create(createPloDto: CreatePloDto) {
    const { curriculumId, ...rest } = createPloDto;

    const plo = await this.prisma.plo.create({
      data: {
        ...rest,
        curriculum: { connect: { id: curriculumId } },
      },
    });
    return plo;
  }

  // Find all PLOs
  async findAll(filter?: FilterParams) {
    const { curriculumCode } = filter || {}; // Ensure filter is not undefined

    const whereCondition: Prisma.ploWhereInput = curriculumCode
      ? { curriculum: { code: curriculumCode } }
      : {}; // Only filter if curriculumCode exists

    const options: Prisma.ploFindManyArgs = {
      where: whereCondition, //  Directly pass whereOption (no extra object)
      include: {
        curriculum: {
          select: {
            id: true,
            code: true,
            thaiName: true,
            engName: true,
          },
        },
        clos: true,
      },
    };
    const [list, total] = await Promise.all([
      this.prisma.plo.findMany(options),
      this.prisma.plo.count({ where: whereCondition }),
    ]);
    return { data: list, total };
  }

  // Find a PLO by ID
  async findOne(id: number) {
    const plo = await this.prisma.plo.findUnique({
      where: { id },
      include: { clos: true },
    });

    if (!plo) {
      throw new NotFoundException(`PLO with ID ${id} not found`);
    }

    return plo;
  }

  async findOptions(curriculumId: number) {
    const options = {
      select: {
        id: true,
        thaiName: true,
        engName: true,
      },
      where: { curriculumId },
    } as Prisma.ploFindManyArgs;
    return await this.prisma.plo.findMany(options);
  }

  // Update a PLO by ID
  async update(id: number, updatePloDto: UpdatePloDto) {
    const plo = await this.prisma.plo.update({
      where: { id },
      data: updatePloDto,
    });
    return plo;
  }

  // Remove a PLO by ID
  async remove(id: number): Promise<void> {
    await this.prisma.plo.delete({
      where: { id },
    });
  }
}
