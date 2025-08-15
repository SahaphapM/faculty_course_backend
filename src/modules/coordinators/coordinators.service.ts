import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCoordinatorDto } from 'src/generated/nestjs-dto/create-coordinator.dto';
import { UpdateCoordinatorDto } from 'src/generated/nestjs-dto/update-coordinator.dto';
import { Prisma } from '@prisma/client';
import { CoordinatorFilterDto } from 'src/dto/filters/filter.coordinator.dto';
import { createPaginatedData } from 'src/utils/paginated.utils';

@Injectable()
export class CoordinatorsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCoordinatorDto) {

    const coordinator = await this.prisma.coordinator.create({
      data: dto,
    });

    return coordinator;
  }

  async findAll(pag?: CoordinatorFilterDto) {
    const { limit = 10, page = 1, orderBy = 'asc', sort = 'id', nameCodeMail } = pag || {};

    const whereCondition: Prisma.coordinatorWhereInput = {
      ...(nameCodeMail && {
        OR: [
          { thaiName: { contains: nameCodeMail } },
          { engName: { contains: nameCodeMail } },
        ],
      }),
    };

    const options: Prisma.coordinatorFindManyArgs = {
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { [sort]: orderBy },
      where: whereCondition,
    };

    try {
      const [coordinators, total] = await Promise.all([
        this.prisma.coordinator.findMany(options),
        this.prisma.coordinator.count({ where: whereCondition }),
      ]);
      return createPaginatedData(coordinators, total, page, limit);
    } catch (error) {
      console.error('Error fetching coordinators:', error);
      throw new InternalServerErrorException('Failed to fetch coordinators');
    }
  }

  async findOne(id: number) {
    const coordinator = await this.prisma.coordinator.findUnique({
      where: { id },
    });
    if (!coordinator) {
      throw new NotFoundException(`Coordinator with ID ${id} not found`);
    }
    return coordinator;
  }

  async update(id: number, dto: UpdateCoordinatorDto) {
    try {
      const coordinator = await this.prisma.coordinator.update({
        where: { id },
        data: dto,
      });
      return coordinator;
    } catch (error) {
      throw new BadRequestException('Failed to update Coordinator');
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.coordinator.delete({
        where: { id },
      });
      return `Success Delete ID ${id}`;
    } catch (error) {
      throw new BadRequestException('Failed to remove Coordinator');
    }
  }

    async updateCoordinatorToCurriculum(
    coordinatorIds: number[],
    curriculumId: number,
  ) {
    const curriculum = await this.prisma.curriculum.findUnique({
      where: { id: curriculumId },
      include: {
        coordinators: {
          select: {
            coordinatorId: true,
          },
        },
      },
    });

    if (!curriculum) {
      throw new NotFoundException(`Curriculum with ID ${curriculumId} not found`);
    }

    const currentCoordinatorIds = curriculum.coordinators.map(
      (c) => c.coordinatorId,
    );
    const newCoordinatorIds = coordinatorIds || [];

    const idsToDisconnect = currentCoordinatorIds.filter(
      (id) => !newCoordinatorIds.includes(id),
    );

    const idsToConnect = newCoordinatorIds.filter(
      (id) => !currentCoordinatorIds.includes(id),
    );

    return this.prisma.$transaction(async (prisma) => {
      if (idsToDisconnect.length > 0) {
        await prisma.curriculum_coordinators.deleteMany({
          where: {
            curriculumId: curriculumId,
            coordinatorId: { in: idsToDisconnect },
          },
        });
      }

      if (idsToConnect.length > 0) {
        await prisma.curriculum_coordinators.createMany({
          data: idsToConnect.map((coordinatorId) => ({
            curriculumId,
            coordinatorId,
          })),
        });
      }

      return {
        message: `Successfully updated coordinators for curriculum ID ${curriculumId}`,
      };
    });
  }
}
