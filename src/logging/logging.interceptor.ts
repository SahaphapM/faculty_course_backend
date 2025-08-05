import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { GraylogService } from './graylog.service';
import { Request } from 'express';

type RedactList = string[];

function redactObject(obj: any, fields: RedactList): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((v) => redactObject(v, fields));
  const clone: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (fields.includes(k)) {
      clone[k] = '***redacted***';
    } else if (typeof v === 'object' && v !== null) {
      clone[k] = redactObject(v, fields);
    } else {
      clone[k] = v;
    }
  }
  return clone;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly redactFields: RedactList;

  constructor(private readonly graylog: GraylogService) {
    const conf =
      process.env.LOG_REDACT_FIELDS || 'password,token,authorization';
    this.redactFields = conf
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startedAt = Date.now();

    const httpCtx = context.switchToHttp();
    const req = httpCtx.getRequest<Request>();
    const method = req?.method;
    const url = req?.originalUrl || req?.url;
    const ip = req?.ip;
    const user = (req as any)?.user;
    const headers = req?.headers
      ? redactObject(req.headers, this.redactFields)
      : undefined;
    const params = req?.params
      ? redactObject(req.params, this.redactFields)
      : undefined;
    const query = req?.query
      ? redactObject(req.query, this.redactFields)
      : undefined;
    const body = req?.body
      ? redactObject(req.body, this.redactFields)
      : undefined;

    const baseCtx = {
      method,
      url,
      ip,
      userId: user?.id || user?.sub,
      userEmail: user?.email,
      headers,
      params,
      query,
      body,
    };

    return next.handle().pipe(
      tap(async (data) => {
        const durationMs = Date.now() - startedAt;
        const res = httpCtx.getResponse();
        const statusCode = res?.statusCode;

        const responsePreview =
          data && typeof data === 'object'
            ? redactObject(
                // avoid logging huge responses
                Array.isArray(data)
                  ? { items: data.length }
                  : { keys: Object.keys(data).slice(0, 20) },
                this.redactFields,
              )
            : { value: String(data).slice(0, 200) };

        await this.graylog.info('HTTP request completed', {
          ...baseCtx,
          statusCode,
          durationMs,
          responsePreview,
        });
      }),
      catchError((err) => {
        const durationMs = Date.now() - startedAt;
        const res = httpCtx.getResponse();
        const statusCode = res?.statusCode ?? err?.status ?? 500;

        // Prefer original stack if available
        const message = err?.message || 'Unhandled error';
        this.graylog.error('HTTP request error', err, {
          ...baseCtx,
          statusCode,
          durationMs,
          errorName: err?.name,
          errorMessage: message,
        });

        // rethrow after logging
        throw err;
      }),
    );
  }
}
