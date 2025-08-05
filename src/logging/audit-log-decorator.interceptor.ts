import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from './audit-log.service';
import { AUDIT_LOG_KEY } from './audit-log.decorator';
import { Request, Response } from 'express';

@Injectable()
export class AuditLogDecoratorInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditLogOptions = this.reflector.get(
      AUDIT_LOG_KEY,
      context.getHandler(),
    );

    // If no audit log decorator is present, skip
    if (!auditLogOptions) {
      return next.handle();
    }

    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();
    const user = (request as any).user;

    const startTime = Date.now();

    return next.handle().pipe(
      tap((data) => {
        try {
          // Prepare metadata
          const metadata: Record<string, any> = {
            method: request.method,
            url: request.url,
            duration: Date.now() - startTime,
            userAgent: request.headers['user-agent'],
            ip: request.ip,
            statusCode: response.statusCode,
          };

          // Include request data if specified
          if (auditLogOptions.includeRequest) {
            metadata.request = {
              params: request.params,
              query: request.query,
              body: request.body,
            };
          }

          // Include response data if specified
          if (auditLogOptions.includeResponse) {
            metadata.response = data;
          }

          // Extract resource ID from request params if not specified
          const resourceId = this.extractResourceId(request);

          // Log the audit entry
          this.auditLogService.log({
            userId: user?.id,
            action: auditLogOptions.action,
            resource: auditLogOptions.resource,
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

  private extractResourceId(request: Request): string | undefined {
    // Try to extract ID from common patterns
    if (request.params.id) {
      return request.params.id;
    }
    
    if (request.params[`${request.route?.path.split('/')[1]}Id`]) {
      return request.params[`${request.route?.path.split('/')[1]}Id`];
    }
    
    // Try to extract from body for POST requests
    if (request.method === 'POST' && request.body.id) {
      return request.body.id;
    }
    
    return undefined;
  }
}