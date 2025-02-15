import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Adjust the import path as needed
import { CreatePloDto } from 'src/generated/nestjs-dto/create-plo.dto';
import { UpdatePloDto } from 'src/generated/nestjs-dto/update-plo.dto';

@Injectable()
export class PloService {
  constructor(private prisma: PrismaService) {}

  // Create a new PLO
  async create(createPloDto: CreatePloDto) {
    const { curriculumId, ...rest } = createPloDto;

    // Check if the curriculum exists
    const curriculum = await this.prisma.curriculum.findUnique({
      where: { id: curriculumId },
    });

    if (!curriculum) {
      throw new NotFoundException(
        `Curriculum with ID ${curriculumId} not found`,
      );
    }

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
  async findAll() {
    try {
      return await this.prisma.plo.findMany({
        include: {
          curriculum: true,
          clos: true,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to fetch PLOs');
    }
  }

  // Find all PLOs by curriculum ID
  async findAllByCurriculum(curriculumId: number) {
    try {
      return await this.prisma.plo.findMany({
        where: { curriculumId },
        include: { clos: true },
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch PLOs for curriculum ID ${curriculumId}`,
      );
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
