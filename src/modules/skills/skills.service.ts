import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UpdateSkillDto } from 'src/generated/nestjs-dto/update-skill.dto';
import { CreateSkillDto } from 'src/generated/nestjs-dto/create-skill.dto';
import { Skill } from 'src/generated/nestjs-dto/skill.entity';
import { SkillFilterDto } from 'src/dto/filters/filter.skill.dto';
import { createPaginatedData } from 'src/utils/paginated.utils';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

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
      console.error('🚀 ~ SkillsService ~ create ~ error:', error);
      throw new BadRequestException(`Failed to create skill: ${error}`);
    }
  }

  async findOptions(curriculumId: number) {
    const options = {
      select: {
        id: true,
        thaiName: true,
        engName: true,
        subs: true,
      },
      where: {
        curriculumId,
        subs: {
          none: {}, // ไม่มี subs
        },
      },
    } as Prisma.skillFindManyArgs;
    return await this.prisma.skill.findMany(options);
  }

  // Find all skills with pagination and basic search
  async findAll(pag?: SkillFilterDto) {
    const defaultLimit = 10;
    const defaultPage = 1;

    const { limit, page, orderBy, sort, nameCode, domain } = pag || {};

    const whereCondition: Prisma.skillWhereInput = {
      parentId: null, // Root skills only
      ...(nameCode && {
        OR: [
          { thaiName: { contains: nameCode } },
          { engName: { contains: nameCode } },
        ],
      }),
      ...(domain && { domain }),
    };

    const options: Prisma.skillFindManyArgs = {
      take: limit || defaultLimit,
      skip: ((page || defaultPage) - 1) * (limit || defaultLimit),
      orderBy: { [(sort === '' ? 'id' : sort) ?? 'id']: orderBy ?? 'asc' },
      include: this.getSkillIncludeStructure(),
      where: whereCondition,
    };

    const [skills, total] = await Promise.all([
      this.prisma.skill.findMany(options),
      this.prisma.skill.count({ where: options.where }),
    ]);

    if (!pag) {
      return skills;
    }
    return createPaginatedData(
      skills,
      total,
      Number(page || defaultPage),
      Number(limit || defaultLimit),
    );
  }

  // Find skills by curriculum with pagination
  async findByCurriculum(curriculumId: number, pag?: SkillFilterDto) {
    const defaultLimit = 15;
    const defaultPage = 1;

    const { limit, page, orderBy, sort, nameCode, domain } = pag || {};

    const whereCondition: Prisma.skillWhereInput = {
      parentId: null,
      curriculumId: curriculumId,
      ...(nameCode && {
        OR: [
          { thaiName: { contains: nameCode } },
          { engName: { contains: nameCode } },
        ],
      }),
      ...(domain && { domain }),
    };

    const options: Prisma.skillFindManyArgs = {
      take: limit || defaultLimit,
      skip: ((page || defaultPage) - 1) * (limit || defaultLimit),
      orderBy: { [(sort === '' ? 'id' : sort) ?? 'id']: orderBy ?? 'asc' },
      include: this.getSkillIncludeStructure(),
      where: whereCondition,
    };

    const [skills, total] = await Promise.all([
      this.prisma.skill.findMany(options),
      this.prisma.skill.count({ where: options.where }),
    ]);

    if (!pag) {
      return skills;
    }
    return createPaginatedData(
      skills,
      total,
      Number(page || defaultPage),
      Number(limit || defaultLimit),
    );
  }

  // Find skills by branch
  async findByBranch(branchId: number, pag?: SkillFilterDto) {
    const defaultLimit = 10;
    const defaultPage = 1;

    const { limit, page, orderBy, sort, nameCode, domain } = pag || {};

    const whereCondition: Prisma.skillWhereInput = {
      parentId: null,
      OR: [
        {
          curriculum: {
            branchId: branchId,
          },
        },
        {
          subs: {
            some: {
              curriculum: {
                branchId: branchId,
              },
            },
          },
        },
        {
          subs: {
            some: {
              subs: {
                some: {
                  curriculum: {
                    branchId: branchId,
                  },
                },
              },
            },
          },
        },
      ],
      ...(nameCode && {
        OR: [
          { thaiName: { contains: nameCode } },
          { engName: { contains: nameCode } },
        ],
      }),
      ...(domain && { domain }),
    };

    const options: Prisma.skillFindManyArgs = {
      take: limit || defaultLimit,
      skip: ((page || defaultPage) - 1) * (limit || defaultLimit),
      orderBy: { [(sort === '' ? 'id' : sort) ?? 'id']: orderBy ?? 'asc' },
      include: this.getSkillIncludeStructure(),
      where: whereCondition,
    };

    const [skills, total] = await Promise.all([
      this.prisma.skill.findMany(options),
      this.prisma.skill.count({ where: options.where }),
    ]);

    if (!pag) {
      return skills;
    }
    return createPaginatedData(
      skills,
      total,
      Number(page || defaultPage),
      Number(limit || defaultLimit),
    );
  }

  // Find skills by faculty
  async findByFaculty(facultyId: number, pag?: SkillFilterDto) {
    const defaultLimit = 10;
    const defaultPage = 1;

    const { limit, page, orderBy, sort, nameCode, domain } = pag || {};

    const whereCondition: Prisma.skillWhereInput = {
      parentId: null,
      OR: [
        {
          curriculum: {
            branch: {
              facultyId: facultyId,
            },
          },
        },
        {
          subs: {
            some: {
              curriculum: {
                branch: {
                  facultyId: facultyId,
                },
              },
            },
          },
        },
        {
          subs: {
            some: {
              subs: {
                some: {
                  curriculum: {
                    branch: {
                      facultyId: facultyId,
                    },
                  },
                },
              },
            },
          },
        },
      ],
      ...(nameCode && {
        OR: [
          { thaiName: { contains: nameCode } },
          { engName: { contains: nameCode } },
        ],
      }),
      ...(domain && { domain }),
    };

    const options: Prisma.skillFindManyArgs = {
      take: limit || defaultLimit,
      skip: ((page || defaultPage) - 1) * (limit || defaultLimit),
      orderBy: { [(sort === '' ? 'id' : sort) ?? 'id']: orderBy ?? 'asc' },
      include: this.getSkillIncludeStructure(),
      where: whereCondition,
    };

    const [skills, total] = await Promise.all([
      this.prisma.skill.findMany(options),
      this.prisma.skill.count({ where: options.where }),
    ]);

    if (!pag) {
      return skills;
    }
    return createPaginatedData(
      skills,
      total,
      Number(page || defaultPage),
      Number(limit || defaultLimit),
    );
  }

  // Find skills by subject
  async findBySubject(subjectId: number, pag?: SkillFilterDto) {
    const defaultLimit = 10;
    const defaultPage = 1;

    const { limit, page, orderBy, sort, nameCode, domain } = pag || {};

    const whereCondition: Prisma.skillWhereInput = {
      parentId: null,
      OR: [
        { clos: { some: { subjectId } } },
        {
          subs: {
            some: {
              clos: { some: { subjectId } },
            },
          },
        },
        {
          subs: {
            some: {
              subs: {
                some: {
                  clos: { some: { subjectId } },
                },
              },
            },
          },
        },
        {
          subs: {
            some: {
              subs: {
                some: {
                  subs: {
                    some: {
                      clos: { some: { subjectId } },
                    },
                  },
                },
              },
            },
          },
        },
      ],
      ...(nameCode && {
        OR: [
          { thaiName: { contains: nameCode } },
          { engName: { contains: nameCode } },
        ],
      }),
      ...(domain && { domain }),
    };

    const options: Prisma.skillFindManyArgs = {
      take: limit || defaultLimit,
      skip: ((page || defaultPage) - 1) * (limit || defaultLimit),
      orderBy: { [(sort === '' ? 'id' : sort) ?? 'id']: orderBy ?? 'asc' },
      include: this.getSkillIncludeStructure(),
      where: whereCondition,
    };

    const [skills, total] = await Promise.all([
      this.prisma.skill.findMany(options),
      this.prisma.skill.count({ where: options.where }),
    ]);

    if (!pag) {
      return skills;
    }
    return createPaginatedData(
      skills,
      total,
      Number(page || defaultPage),
      Number(limit || defaultLimit),
    );
  }

  // Helper method for consistent include structure
  private getSkillIncludeStructure() {
    return {
      subs: {
        // level 2
        select: {
          parentId: true,
          id: true,
          thaiName: true,
          engName: true,
          subs: {
            // level 3
            select: {
              parentId: true,
              id: true,
              thaiName: true,
              engName: true,
              subs: {
                // level 4
                select: {
                  parentId: true,
                  id: true,
                  thaiName: true,
                  engName: true,
                  subs: {
                    // level 5
                    select: {
                      parentId: true,
                      id: true,
                      thaiName: true,
                      engName: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
  }

  // Find a skill by ID
  async findOne(id: number) {
    try {
      const skill = await this.prisma.skill.findUnique({
        where: { id },
        include: {
          subs: {
            include: {
              subs: {
                include: {
                  subs: true,
                },
              },
            },
          },
          parent: true,
          // curriculum: true,
        },
      });

      if (!skill) {
        throw new NotFoundException(`Skill with ID ${id} not found`);
      }

      return skill;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch skill with ID ${id}, ${error.message}`,
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
      console.error('🚀 ~ SkillsService ~ update ~ error:', error);
      throw new BadRequestException(`Failed to update skill`);
    }
  }

  // Remove a skill by ID
  async remove(id: number) {
    try {
      const skill = await this.prisma.skill.delete({
        where: { id },
      });
      return skill;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Skill with ID ${id} not found`);
      }
      throw new BadRequestException(`Failed to remove skill: ${error.message}`);
    }
  }

  // New method to normalize top-level skills
  private normalizeTopLevelSkills(skills: Skill[]): Skill[] {
    // Create a set of all skill IDs that are subs of any skill
    const subIds = new Set<number>();
    skills.forEach((skill) => {
      skill.subs.forEach((sub) => subIds.add(sub.id));
    });

    // Filter out skills from the top level if their ID is in subIds
    const normSkills = skills.reduce((acc: Skill[], cur: Skill) => {
      if (!subIds.has(cur.id)) {
        // Only keep skills that are not subs of others
        acc.push(cur);
      }
      return acc;
    }, []);

    return normSkills;
  }
}
