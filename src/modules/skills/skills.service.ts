import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Adjust the import path as needed
import { Prisma } from '@prisma/client'; // Import Prisma types
import { FilterParams } from 'src/dto/filter-params.dto'; // Adjust the import path as needed
import { UpdateSkillDto } from 'src/generated/nestjs-dto/update-skill.dto';
import { CreateSkillDto } from 'src/generated/nestjs-dto/create-skill.dto';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  // Create a new skill
  async create(createSkillDto: CreateSkillDto) {
    const { curriculumId, ...rest } = createSkillDto;

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
      const skill = await this.prisma.skill.create({
        data: {
          ...rest,
          curriculumId: curriculumId,
        },
      });
      return skill;
    } catch (error) {
      throw new BadRequestException(`Failed to create skill: ${error.message}`);
    }
  }

  // Find all skills with pagination and search
  async findAll(pag?: FilterParams) {
    const defaultLimit = 10;
    const defaultPage = 1;

    const { name, limit, page, orderBy } = pag || {};

    const options: Prisma.skillFindManyArgs = {
      take: limit || defaultLimit,
      skip: ((page || defaultPage) - 1) * (limit || defaultLimit),
      orderBy: { id: orderBy || 'asc' },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        curriculum: {
          select: {
            id: true,
            thaiName: true,
          },
        },
        subs: true,
      },
    };

    if (name) {
      options.where = {
        OR: [{ name: { contains: name } }],
      };
    }

    try {
      if (pag) {
        const [skills, total] = await Promise.all([
          this.prisma.skill.findMany(options),
          this.prisma.skill.count({ where: options.where }),
        ]);
        return { data: skills, total };
      } else {
        return await this.prisma.skill.findMany(options);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      throw new InternalServerErrorException('Failed to fetch skills');
    }
  }

  // Find all skills by curriculum ID
  async findAllByCurriculum(curriculumId: number) {
    try {
      // Find all child skill IDs
      const childSkillIds = await this.prisma.skill.findMany({
        where: {
          curriculumId,
          parentId: { not: null }, // Only fetch child skills
        },
        select: { id: true }, // Select only IDs
      });

      const childIdsSet = new Set(childSkillIds.map((skill) => skill.id));

      // Fetch only root skills (excluding children)
      const skills = await this.prisma.skill.findMany({
        where: {
          curriculumId,
          id: { notIn: [...childIdsSet] }, // Exclude child IDs
        },
        include: {
          subs: {
            include: {
              subs: true,
            },
          },
          parent: true,
        },
      });

      return skills;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch skills for curriculum ID ${curriculumId}`,
      );
    }
  }

  // Find a skill by ID
  async findOne(id: number) {
    try {
      const skill = await this.prisma.skill.findUnique({
        where: { id },
        include: {
          subs: true,
          parent: true,
          curriculum: true,
        },
      });

      if (!skill) {
        throw new NotFoundException(`Skill with ID ${id} not found`);
      }

      return skill;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch skill with ID ${id}`,
      );
    }
  }

  // Update a skill by ID
  async update(id: number, updateSkillDto: UpdateSkillDto) {
    try {
      const skill = await this.prisma.skill.update({
        where: { id },
        data: updateSkillDto,
      });
      return skill;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Skill with ID ${id} not found`);
      }
      throw new BadRequestException(`Failed to update skill: ${error.message}`);
    }
  }

  // Remove a skill by ID
  async remove(id: number): Promise<void> {
    try {
      await this.prisma.skill.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Skill with ID ${id} not found`);
      }
      throw new BadRequestException(`Failed to remove skill: ${error.message}`);
    }
  }

  // Create a sub-skill under a parent skill
  // async createSubSkills(parentId: number, createSkillDto: CreateSkillDto) {
  //   const parentSkill = await this.findOne(parentId);

  //   const curriculum = await this.prisma.curriculum.findUnique({
  //     where: { id: createSkillDto.curriculumId || parentSkill.curriculumId },
  //   });

  //   if (!curriculum) {
  //     throw new NotFoundException(
  //       `Curriculum with ID ${createSkillDto.curriculumId} not found`,
  //     );
  //   }

  //   try {
  //     const subSkill = await this.prisma.skill.create({
  //       data: {
  //         ...createSkillDto,
  //         curriculumId: curriculum.id,
  //         parentId: parentId,
  //       },
  //     });
  //     return subSkill;
  //   } catch (error) {
  //     throw new BadRequestException(
  //       `Failed to create sub-skill: ${error.message}`,
  //     );
  //   }
  // }

  // // Remove a sub-skill from a parent skill
  // async removeSubSkillId(parentId: number, subSkillId: number) {
  //   const parentSkill = await this.findOne(parentId);
  //   const childSkill = await this.findOne(subSkillId);

  //   if (!parentSkill || !childSkill) {
  //     throw new NotFoundException('Parent or child skill not found');
  //   }

  //   try {
  //     await this.prisma.skill.update({
  //       where: { id: subSkillId },
  //       data: {
  //         parent: { disconnect: true },
  //       },
  //     });
  //     return parentSkill;
  //   } catch (error) {
  //     throw new BadRequestException(
  //       `Failed to remove sub-skill: ${error.message}`,
  //     );
  //   }
  // }
}
