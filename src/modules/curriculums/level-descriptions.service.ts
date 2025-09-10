import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LevelDescription } from 'src/generated/nestjs-dto/levelDescription.entity';

@Injectable()
export class LevelDescriptionsService {
  constructor(private prisma: PrismaService) {}

  async updateLevelDescriptions(updates: Partial<LevelDescription>[]) {
    console.dir(updates, { depth: 3 });
    return Promise.all(
      updates.map((update) =>
        this.prisma.level_description.update({
          where: { id: update.id },
          data: {
            ...(update.name !== undefined && { name: update.name }),
            ...(update.description !== undefined && {
              description: update.description,
            }),
          },
        }),
      ),
    );
  }

  async getAllLevelDescription(curriculumCode: string) {
    const curriculum = await this.prisma.curriculum.findFirst({
      where: {
        code: curriculumCode,
        active: true,
      },
      select: {
        level_descriptions: true,
      },
    });

    if (!curriculum) {
      throw new NotFoundException(
        `Curriculum with code ${curriculumCode} not found`,
      );
    }

    return curriculum?.level_descriptions;
  }
}
