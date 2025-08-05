import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from './audit-log.service';
import { Request } from 'express';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const method = request.method;
    const url = request.originalUrl || request.url;
    const user = (request as any).user;

    // Only log mutating operations
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        try {
          // Extract resource and action from URL and method
          const resource = this.extractResource(url);
          const action = this.mapMethodToAction(method);
          
          // Extract resource ID if present in URL
          const resourceId = this.extractResourceId(url);

          // Prepare metadata
          const metadata = {
            method,
            url,
            duration: Date.now() - startTime,
            userAgent: request.headers['user-agent'],
            ip: request.ip,
            statusCode: httpContext.getResponse().statusCode,
          };

          // Log the audit entry
          this.auditLogService.log({
            userId: user?.id,
            action,
            resource,
            resourceId,
            metadata,
          }).catch(() => {
            // Silently fail to avoid disrupting the main flow
          });
        } catch (error) {
          // Silently fail to avoid disrupting the main flow
          console.error('Failed to log audit entry:', error);
        }
      }),
    );
  }

  private extractResource(url: string): string {
    // Extract resource name from URL
    // Example: /api/users/123 -> users
    const parts = url.split('/').filter(part => part.length > 0);
    if (parts.length > 0) {
      // Return the first part that looks like a resource name
      for (const part of parts) {
        if (!['api', 'v1'].includes(part) && !/^\d+$/.test(part)) {
          return part;
        }
      }
    }
    return 'unknown';
  }

  private extractResourceId(url: string): string | undefined {
    // Extract resource ID from URL
    // Example: /api/users/123 -> 123
    const parts = url.split('/').filter(part => part.length > 0);
    if (parts.length > 0) {
      // Return the first part that looks like an ID
      for (let i = parts.length - 1; i >= 0; i--) {
        if (/^\d+$/.test(parts[i])) {
          return parts[i];
        }
      }
    }
    return undefined;
  }

  private mapMethodToAction(method: string): string {
    switch (method) {
      case 'POST':
        return 'CREATE';
      case 'PUT':
        return 'UPDATE';
      case 'PATCH':
        return 'PARTIAL_UPDATE';
      case 'DELETE':
        return 'DELETE';
      default:
        return 'UNKNOWN';
    }
  }
}