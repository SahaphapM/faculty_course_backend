import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Adjust the import path as needed
import { CreatePloDto } from 'src/generated/nestjs-dto/create-plo.dto';
import { UpdatePloDto } from 'src/generated/nestjs-dto/update-plo.dto';
import { Prisma } from '@prisma/client';
import { PloFilterDto } from 'src/dto/filters/filter.plo.dto';
import { createPaginatedData } from 'src/utils/paginated.utils';
import { DefaultPaginaitonValue } from 'src/configs/pagination.configs';
import { AppErrorCode } from 'src/common/error-codes';
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
      search,
      curriculumId,
    } = filter || {};

    const whereCondition: Prisma.ploWhereInput = {
      curriculum: { id: curriculumId },
      ...(search && {
        OR: [
          { name: { contains: search } },
          { thaiDescription: { contains: search } },
          { engDescription: { contains: search } },
        ],
      }),
    };

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
  async remove(id: number) {
    // 1) เจอไหม
    const plo = await this.prisma.plo.findUnique({ where: { id } });
    if (!plo)
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'PLO not found',
      });

    // 2) เช็คลูกที่บล็อกการลบ (CLO → onDelete: Restrict ใน schema ตอนนี้)
    const cloCount = await this.prisma.clo.count({ where: { ploId: id } });

    if (cloCount > 0) {
      // Get the actual blocking CLOs with details
      const blockingClos = await this.prisma.clo.findMany({
        where: { ploId: id },
        select: {
          id: true,
          name: true,
          subject: {
            select: {
              id: true,
              code: true,
              thaiName: true,
              engName: true,
            },
          },
        },
        take: 10, // Limit to first 10 for performance
      });

      throw new ConflictException({
        code: AppErrorCode.FK_CONFLICT,
        message: `Cannot delete PLO "${plo.name || plo.type}" because there are CLOs referencing it.`,
        entity: 'PLO',
        entityName: plo.name || plo.type || `PLO #${id}`,
        id,
        blockers: [{
          relation: 'CLO',
          count: cloCount,
          field: 'ploId',
          entities: blockingClos.map(clo => ({
            id: clo.id,
            name: clo.name || `CLO #${clo.id}`,
            details: clo.subject ? `${clo.subject.code} - ${clo.subject.thaiName || clo.subject.engName}` : 'No subject',
          })),
        }],
        suggestions: [
          'Delete or reassign those CLOs to a different PLO.',
          'If business allows, detach CLOs first (set ploId = null) then delete PLO.',
          'Consider soft-delete/archiving instead of hard delete.',
        ],
      });
    }

    // 3) ผ่านแล้วค่อยลบ
    await this.prisma.plo.delete({ where: { id } });
    return { ok: true };
  }

  // ตัวเลือก: ลบแบบ “detach แล้วค่อยลบ” (ถ้านโยบายอนุญาต)
  async forceDeletePloByDetaching(id: number) {
    return this.prisma.$transaction(async (tx) => {
      await tx.clo.updateMany({ where: { ploId: id }, data: { ploId: null } });
      await tx.plo.delete({ where: { id } });
      return { ok: true, detached: true };
    });
  }
}
