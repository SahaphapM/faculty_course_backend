import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Adjust the import path as needed
import { CreatePloDto } from 'src/generated/nestjs-dto/create-plo.dto';
import { UpdatePloDto } from 'src/generated/nestjs-dto/update-plo.dto';
import { Prisma } from '@prisma/client';
import { PloFilterDto } from 'src/dto/filters/filter.plo.dto';
import { createPaginatedData } from 'src/utils/paginated.utils';
import { DefaultPaginaitonValue } from 'src/configs/pagination.configs';
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
  async findAll(filter?: PloFilterDto) {
    const defaultLimit = DefaultPaginaitonValue.limit;
    const defaultPage = DefaultPaginaitonValue.page;
    const {
      limit,
      page,
      orderBy = DefaultPaginaitonValue.orderBy,
      sort = DefaultPaginaitonValue.sortBy,
      curriculumCode,
    } = filter || {};

    const whereCondition: Prisma.ploWhereInput = curriculumCode
      ? { curriculum: { code: curriculumCode } }
      : {};

    // Parse sort field and direction
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortDirection = sort.startsWith('-') ? 'desc' : orderBy;

    const options: Prisma.ploFindManyArgs = {
      where: whereCondition,
      take: limit ?? defaultLimit,
      skip: ((page ?? defaultPage) - 1) * (limit ?? defaultLimit),
      orderBy: {
        [sortField]: sortDirection,
      },
    };

    const [list, total] = await Promise.all([
      this.prisma.plo.findMany(options),
      this.prisma.plo.count({ where: whereCondition }),
    ]);

    return createPaginatedData(
      list,
      total,
      Number(page ?? defaultPage),
      Number(limit ?? defaultLimit),
    );
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
        name: true,
        thaiDescription: true,
        engDescription: true,
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
