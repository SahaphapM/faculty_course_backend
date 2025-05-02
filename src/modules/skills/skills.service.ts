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

  // Find all skills with pagination and search
  async findAll(pag?: SkillFilterDto) {
    const defaultLimit = 10;
    const defaultPage = 1;

    const {
      limit,
      page,
      orderBy,
      sort,
      nameCode,
      domain,
      curriculumId,
      branchId,
      facultyId,
      subjectId,
    } = pag || {};

    console.log('pag', pag);

    const whereCondition: Prisma.skillWhereInput = {
      parentId: null, // Root skill เท่านั้น
      ...(facultyId && {
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
      }),

      ...(branchId && {
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
      }),

      ...(curriculumId && {
        OR: [
          { curriculumId: curriculumId },
          {
            subs: {
              some: {
                curriculumId: curriculumId,
              },
            },
          },
          {
            subs: {
              some: {
                subs: {
                  some: {
                    curriculumId: curriculumId,
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
                        curriculumId: curriculumId,
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      }),

      ...(subjectId && {
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
      }),

      ...(nameCode && {
        OR: [
          { thaiName: { contains: nameCode } },
          { engName: { contains: nameCode } },
          {
            subs: {
              some: {
                OR: [
                  { thaiName: { contains: nameCode } },
                  { engName: { contains: nameCode } },
                  {
                    subs: {
                      some: {
                        OR: [
                          { thaiName: { contains: nameCode } },
                          { engName: { contains: nameCode } },
                          {
                            subs: {
                              some: {
                                OR: [
                                  { thaiName: { contains: nameCode } },
                                  { engName: { contains: nameCode } },
                                  // เพิ่มต่อถ้าจำเป็น
                                ],
                              },
                            },
                          },
                          // เพิ่มต่อถ้าจำเป็น
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      }),
      ...(domain && { domain }),
    };

    const options: Prisma.skillFindManyArgs = {
      take: limit || defaultLimit,
      skip: ((page || defaultPage) - 1) * (limit || defaultLimit),
      orderBy: { [sort ?? 'id']: orderBy ?? 'asc' },
      include: {
        subs: {
          // level 2
          select: {
            id: true,
            thaiName: true,
            engName: true,
            subs: {
              // level 3
              select: {
                id: true,
                thaiName: true,
                engName: true,
                subs: {
                  // level 4
                  select: {
                    id: true,
                    thaiName: true,
                    engName: true,
                    subs: {
                      // level 5
                      select: {
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
      },
      where: whereCondition,
    };

    const [skills, total] = await Promise.all([
      this.prisma.skill.findMany(options),
      this.prisma.skill.count({ where: options.where }),
    ]);
    return pag ? { data: skills, total } : skills;
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
