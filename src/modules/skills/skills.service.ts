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
import { SkillFilterDto } from 'src/dto/filters/filter.skill.dto';
import { createPaginatedData } from 'src/utils/paginated.utils';
import { DefaultPaginaitonValue } from 'src/configs/pagination.configs';
import { Subject } from 'src/generated/nestjs-dto/subject.entity';
import { SkillCollection } from 'src/generated/nestjs-dto/skillCollection.entity';

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
        domain: true,
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
    const defaultLimit = DefaultPaginaitonValue.limit;
    const defaultPage = DefaultPaginaitonValue.page;

    const {
      limit,
      page,
      orderBy = DefaultPaginaitonValue.orderBy,
      sort = DefaultPaginaitonValue.sortBy,
      search,
      domain,
      subOnly,
    } = pag || {};

    const whereCondition: Prisma.skillWhereInput = {
      parentId: null, // Root skills only
      ...(search && {
        OR: [
          { thaiName: { contains: search } },
          { engName: { contains: search } },
        ],
      }),
      ...(domain && { domain }),
      ...(subOnly && {
        subs: {
          some: {},
        },
      }),
    };

    const options: Prisma.skillFindManyArgs = {
      take: limit || defaultLimit,
      skip: ((page || defaultPage) - 1) * (limit || defaultLimit),
      orderBy: { [(sort === '' ? 'id' : sort) ?? 'id']: orderBy },
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
    const defaultLimit = DefaultPaginaitonValue.limit;
    const defaultPage = DefaultPaginaitonValue.page;
    const {
      limit,
      page,
      orderBy = DefaultPaginaitonValue.orderBy,
      sort = DefaultPaginaitonValue.sortBy,
      search,
      domain,
    } = pag || {};

    const whereCondition: Prisma.skillWhereInput = {
      parentId: null,
      curriculumId: curriculumId,
      ...(search && {
        OR: [
          { thaiName: { contains: search } },
          { engName: { contains: search } },
        ],
      }),
      ...(domain && { domain }),
    };

    const options: Prisma.skillFindManyArgs = {
      take: limit || defaultLimit,
      skip: ((page || defaultPage) - 1) * (limit || defaultLimit),
      orderBy: { [(sort === '' ? 'id' : sort) ?? 'id']: orderBy },
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
    const defaultLimit = DefaultPaginaitonValue.limit;
    const defaultPage = DefaultPaginaitonValue.page;
    const {
      limit,
      page,
      orderBy = DefaultPaginaitonValue.orderBy,
      sort = DefaultPaginaitonValue.sortBy,
      search,
      domain,
    } = pag || {};

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
      ...(search && {
        OR: [
          { thaiName: { contains: search } },
          { engName: { contains: search } },
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

    const { limit, page, orderBy, sort, search, domain } = pag || {};

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
      ...(search && {
        OR: [
          { thaiName: { contains: search } },
          { engName: { contains: search } },
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

    const { limit, page, orderBy, sort, search, domain } = pag || {};

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
      ...(search && {
        OR: [
          { thaiName: { contains: search } },
          { engName: { contains: search } },
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
          domain: true,
          thaiDescription: true,
          engDescription: true,
          subs: {
            // level 3
            select: {
              parentId: true,
              id: true,
              thaiName: true,
              engName: true,
              domain: true,
              thaiDescription: true,
              engDescription: true,
              subs: {
                // level 4
                select: {
                  parentId: true,
                  id: true,
                  thaiName: true,
                  engName: true,
                  domain: true,
                  thaiDescription: true,
                  engDescription: true,
                  subs: {
                    // level 5
                    select: {
                      parentId: true,
                      id: true,
                      thaiName: true,
                      engName: true,
                      domain: true,
                      thaiDescription: true,
                      engDescription: true,
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

  async subjectStudentSummary(studentCode: string) {
    const student = await this.prisma.student.findUnique({
      where: { code: studentCode },
      include: {
        skill_collections: {
          select: {
            id: true,
            gainedLevel: true,
            clo: {
              select: {
                id: true,
                skill: {
                  select: {
                    id: true,
                    thaiName: true,
                    engName: true,
                  },
                },
                subjectId: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with code ${studentCode} not found`);
    }

    // get unique subjectIds not use map ordinary
    const subjectsIds = [
      ...new Set(
        student.skill_collections.map(
          (skill_collection) => skill_collection.clo.subjectId,
        ),
      ),
    ];

    // group subject
    const subjects = await this.prisma.subject.findMany({
      where: {
        id: {
          in: subjectsIds,
        },
      },
      select: {
        id: true,
        code: true,
        thaiName: true,
        engName: true,
      },
    });

    // ทำดิกชันนารี subjectById เพื่อ lookup เร็ว ๆ
    const subjectById = new Map<number, (typeof subjects)[number]>();
    for (const s of subjects) subjectById.set(s.id, s);

    // สร้างกลุ่ม: subjectId -> { subject, skillCollections[] }
    type NormalizedSC = {
      id: number;
      gainedLevel: number;
      cloId: number;
      skill: { id: number; thaiName: string; engName: string };
    };

    type Grouped = {
      subject: { id: number; thaiName: string; engName: string };
      skillCollections: NormalizedSC[];
    };

    const groups = new Map<number, Grouped>();

    for (const sc of student.skill_collections) {
      const sid = sc.clo?.subjectId;
      if (!sid) continue;
      const subject = subjectById.get(sid);
      if (!subject) continue; // กันเคสข้อมูลไม่แมตช์

      if (!groups.has(sid)) {
        groups.set(sid, { subject, skillCollections: [] });
      }

      groups.get(sid).skillCollections.push({
        id: sc.id,
        gainedLevel: sc.gainedLevel,
        cloId: sc.clo.id,
        skill: {
          id: sc.clo.skill.id,
          thaiName: sc.clo.skill.thaiName,
          engName: sc.clo.skill.engName,
        },
      });
    }

    // แปลง Map -> Array และจัดเรียง (เลือกเกณฑ์ที่ชอบได้)
    const groupedSkillSubject = Array.from(groups.values()).sort((a, b) => {
      const ax = a.subject.thaiName;
      const bx = b.subject.thaiName;
      return ax.localeCompare(bx, 'th'); // หรือ 'en'
    });

    delete student.skill_collections;

    return {
      student: student,
      groupedSkillSubject,
    };
  }
}
