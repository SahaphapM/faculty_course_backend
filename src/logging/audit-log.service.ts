import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppLoggerService } from './app-logger.service';

export interface AuditLogEntry {
  userId?: number;
  action: string;
  resource: string;
  resourceId?: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
  metadata?: Record<string, any>;
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
          before: entry.before || undefined,
          after: entry.after || undefined,
          metadata: entry.metadata || undefined,
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

  async getLogs(
    page: number = 1,
    limit: number = 50,
    filters?: {
      userId?: number;
      action?: string;
      resource?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
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
            timestamp: 'desc',
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
