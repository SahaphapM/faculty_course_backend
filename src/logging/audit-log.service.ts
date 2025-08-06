import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppLoggerService } from './app-logger.service';
import { AuditLogQueryDto } from 'src/dto/filters/filter.audit-log.dto';

export interface AuditLogEntry {
  userId?: number;
  action: string;
  resource: string;
  resourceId?: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
  metadata?: any;
}

@Injectable()
export class AuditLogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService,
  ) {}

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.audit_log.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
          // In current Prisma types, metadata expects string in some generated client versions.
          // But our schema uses Json?. To satisfy both, serialize complex values; pass through strings.
          metadata:
            entry.before == null && entry.after == null && entry.metadata == null
              ? undefined
              : JSON.stringify({
                  before: entry.before ?? null,
                  after: entry.after ?? null,
                  metadata: entry.metadata ?? null,
                }),
        },
      });
    } catch (error) {
      // Log the error but don't throw it to avoid disrupting the main flow
      this.logger.error(
        'Failed to log audit entry: ' + JSON.stringify(error),
        JSON.stringify({ entry }),
      );
    }
  }

  async getLogs(query?: AuditLogQueryDto) {
    const {
      page = 1,
      limit = 10,
      sort = 'desc',
      orderBy = 'timestamp',
      ...filters
    } = query;

    try {
      const where: any = {};

      if (filters?.userId) {
        where.userId = filters.userId;
      }

      if (filters?.action) {
        where.action = {
          contains: filters.action,
          mode: 'insensitive',
        };
      }

      if (filters?.resource) {
        where.resource = {
          contains: filters.resource,
          mode: 'insensitive',
        };
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

      const [logs, total] = await Promise.all([
        this.prisma.audit_log.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {
            [orderBy]: sort,
          },
          include: {
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
}
