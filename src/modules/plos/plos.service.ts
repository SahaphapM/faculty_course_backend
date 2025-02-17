import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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

    try {
      const plo = await this.prisma.plo.create({
        data: {
          ...rest,
          curriculum: { connect: { id: curriculumId } },
        },
      });
      return plo;
    } catch (error) {
      throw new BadRequestException(`Failed to create PLO: ${error.message}`);
    }
  }

  // Find all PLOs
  async findAll(filter?: FilterParams) {
    const { curriculumCode } = filter || {}; // Ensure filter is not undefined

    try {
      const whereOption: Prisma.ploWhereInput = curriculumCode
        ? { curriculum: { code: curriculumCode } }
        : {}; // Only filter if curriculumCode exists

      return await this.prisma.plo.findMany({
        where: whereOption, //  Directly pass whereOption (no extra object)
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
      });
    } catch (error) {
      console.error('Error fetching PLOs:', error);
      throw new BadRequestException('Failed to fetch PLOs');
    }
  }

  // Find a PLO by ID
  async findOne(id: number) {
    try {
      const plo = await this.prisma.plo.findUnique({
        where: { id },
        include: { clos: true },
      });

      if (!plo) {
        throw new NotFoundException(`PLO with ID ${id} not found`);
      }

      return plo;
    } catch (error) {
      throw new BadRequestException(`Failed to fetch PLO with ID ${id}`);
    }
  }

  // Update a PLO by ID
  async update(id: number, updatePloDto: UpdatePloDto) {
    try {
      const plo = await this.prisma.plo.update({
        where: { id },
        data: updatePloDto,
        include: { clos: true },
      });
      return plo;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`PLO with ID ${id} not found`);
      }
      throw new BadRequestException(`Failed to update PLO: ${error.message}`);
    }
  }

  // Remove a PLO by ID
  async remove(id: number): Promise<void> {
    try {
      await this.prisma.plo.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`PLO with ID ${id} not found`);
      }
      throw new BadRequestException(`Failed to remove PLO: ${error.message}`);
    }
  }
}
