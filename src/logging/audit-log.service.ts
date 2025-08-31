import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppLoggerService } from './app-logger.service';
import { AuditLogQueryDto } from 'src/dto/filters/filter.audit-log.dto';
import { AuditLog } from 'src/generated/nestjs-dto/auditLog.entity';
import { CreateAuditLogDto } from 'src/generated/nestjs-dto/create-auditLog.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditLogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService,
  ) {}

  // audit-log.service.ts
  async log(entry: CreateAuditLogDto): Promise<void> {
    try {
      await this.prisma.audit_log.create({
        data: entry,
      });
    } catch (error) {
      this.logger.error(
        'Failed to log audit entry',
        JSON.stringify({ error, entry }),
      );
    }
  }

  async getLogs(query?: AuditLogQueryDto) {
    const {
      page = 1,
      limit = 10,
      sort = 'id',
      orderBy = 'desc',
      keyword,
      ...filters
    } = query;

    try {
      const where: Prisma.audit_logWhereInput = {};

      if (filters?.search) {
        where.OR = [
          { user: { email: { contains: filters.search } } },
          { user: { coordinator: { thaiName: { contains: filters.search } } } },
          { user: { instructor: { thaiName: { contains: filters.search } } } },
          { user: { student: { thaiName: { contains: filters.search } } } },
        ];
      }

      if (filters?.action) {
        where.OR = [{ action: { contains: filters.action } }];
      }

      if (filters?.resource) {
        where.OR = [{ resource: { contains: filters.resource } }];
      }

      if (filters?.startDate || filters?.endDate) {
        where.timestamp = {};
        if (filters.startDate) {
          where.timestamp.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.timestamp.lte = filters.endDate;
        }
      }

      if (keyword) {
        where.OR = [
          { metadata: { string_contains: keyword } },
          { before: { string_contains: keyword } },
          { after: { string_contains: keyword } },
        ];
      }

      const [logs, total] = await Promise.all([
        this.prisma.audit_log.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: [
            {
              [sort]: orderBy.toLowerCase(),
            },
          ],
          select: {
            id: true,
            action: true,
            resource: true,
            resourceId: true,
            timestamp: true,
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        }),
        this.prisma.audit_log.count({ where }),
      ]);

      return {
        data: logs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error('Failed to retrieve audit logs', JSON.stringify(error));
      throw error;
    }
  }

  async getLogById(id: number) {
    try {
      const log = await this.prisma.audit_log.findUnique({
        where: {
          id,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              coordinator: true,
              instructor: true,
              student: true,
            },
          },
        },
      });
      return log;
    } catch (error) {
      this.logger.error('Failed to retrieve audit log', JSON.stringify(error));
      throw error;
    }
  }

  async getTables() {
    try {
      const tables = await this.prisma.$queryRaw<{ table_name: string }[]>`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'skillmap_test'
      `;
      return tables;
    } catch (error) {
      this.logger.error('Failed to retrieve tables', JSON.stringify(error));
      throw error;
    }
  }
}
