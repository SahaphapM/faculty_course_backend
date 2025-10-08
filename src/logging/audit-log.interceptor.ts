import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuditLogService } from './audit-log.service';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const method = request.method;
    const url = request.originalUrl || request.url;
    const user = (request as any).user;

    // Log เฉพาะการเปลี่ยนแปลงข้อมูล
    if (!['POST', 'PUT', 'PATCH', 'DELETE', 'GET'].includes(method)) {
      return next.handle();
    }

    const resource = this.extractResource(url);
    const resourceId = this.extractResourceId(url);
    const startTime = Date.now();

    // ไม่ log สำหรับ resource audit-log และ options endpoints
    if (
      resource === 'audit-log' ||
      resource === 'audit_log' ||
      url.includes('/options')
    ) {
      return next.handle();
    }

    let beforeData: any = null;

    return new Observable((observer) => {
      (async () => {
        if (['PUT', 'PATCH', 'DELETE', 'GET'].includes(method) && resourceId) {
          try {
            beforeData = await (this.prisma as any)[resource]?.findUnique?.({
              where: { id: Number(resourceId) },
            });
          } catch (e) {
            // ไม่ต้อง throw เพื่อไม่ให้กระทบ flow หลัก
          }
        }

        next.handle().subscribe({
          next: async (result) => {
            let afterData: any = null;
            let diff: any = null;
            // console.log('==============================>' + resource + method);

            if (method === 'POST') {
              afterData = result;
            } else if (method === 'PUT' || method === 'PATCH') {
              afterData = result;
              diff = this.getDiff(beforeData, afterData);
            } else if (method === 'DELETE') {
              diff = beforeData;
            }

            await this.auditLogService.log({
              userId: user?.id,
              action: method,
              resource,
              resourceId,
              before: beforeData,
              after: afterData,
              diff: diff,
              metadata: {
                url,
                duration: Date.now() - startTime,
                ip: request.ip,
                statusCode: httpContext.getResponse().statusCode,
              },
            });

            observer.next(result);
            observer.complete();
          },
          error: (err) => observer.error(err),
        });
      })();
    });
  }

  private getDiff(before: Record<string, any>, after: Record<string, any>) {
    if (!before || !after) return null;
    const diff: Record<string, { old: any; new: any }> = {};
    for (const key of Object.keys(after)) {
      if (before[key] !== after[key]) {
        diff[key] = { old: before[key], new: after[key] };
      }
    }
    return diff;
  }

  private extractResource(url: string): string {
    const parts = url.split('/').filter((p) => p.length > 0);
    for (const part of parts) {
      if (!['api', 'v1'].includes(part) && !/^\d+$/.test(part)) {
        // Convert to singular form if needed
        if (part.endsWith('s')) {
          return part.slice(0, -1).toLowerCase();
        }
        return part.toLowerCase();
      }
    }
    return 'unknown';
  }

  private extractResourceId(url: string): string | undefined {
    const parts = url.split('/').filter((p) => p.length > 0);
    const idPart = parts.find((p) => /^\d+$/.test(p));
    return idPart;
  }
}
