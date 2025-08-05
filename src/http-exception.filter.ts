import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { GraylogService } from './logging/graylog.service';

function redact(obj: any, fields: string[]): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((i) => redact(i, fields));
  const out: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (fields.includes(k.toLowerCase())) {
      out[k] = '***redacted***';
    } else if (v && typeof v === 'object') {
      out[k] = redact(v, fields);
    } else out[k] = v;
  }
  return out;
}

@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  private readonly redactFields: string[];

  constructor(private readonly graylog: GraylogService) {
    const conf = process.env.LOG_REDACT_FIELDS || 'password,token,authorization';
    this.redactFields = conf
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let message = 'Internal server error';
    let details: any = null; // Store detailed error info

    // Handle NestJS HttpExceptions (including class-validator errors)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Check if it's a class-validator error
      if (
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse
      ) {
        message = exception.message;
        details = exceptionResponse['message']; // Capture validation error messages
      } else {
        message = exception.message;
      }
    }
    // Handle Prisma Known Errors
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': // Unique constraint failed
          status = 400;
          message = 'Duplicate entry: A record with this value already exists.';
          details = exception.meta;
          break;
        case 'P2025': // Record not found
          status = 404;
          message = 'The requested resource was not found.';
          details = exception.meta;
          break;
        case 'P2003': // Foreign key constraint failed
          status = 400;
          message = 'Invalid foreign key reference.';
          details = exception.meta;
          break;
        default:
          // status is already 500 from initialization
          message = 'Database error occurred.';
          details = exception.meta;
      }
    }
    // Handle Prisma Validation Errors
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = 400;
      message = 'Validation error: Invalid request data.';
      details = exception.message;
    }
    // Handle Other Errors
    else if (exception instanceof Error) {
      message = exception.message;
      details = exception.stack;
    }

    // Log the error with more details locally
    this.logger.error(
      `[${request.method}] ${request.url} - ${message}`,
      JSON.stringify(details, null, 2),
    );

    // Emit to Graylog with request context and stack
    const safeHeaders = redact(request.headers, this.redactFields);
    const safeBody = redact(request.body, this.redactFields);
    const safeQuery = redact(request.query, this.redactFields);
    const safeParams = redact(request.params, this.redactFields);

    this.graylog.error('Unhandled exception', exception instanceof Error ? exception : new Error(message), {
      method: request.method,
      url: request.originalUrl || request.url,
      ip: request.ip,
      statusCode: status,
      message,
      headers: safeHeaders,
      body: safeBody,
      query: safeQuery,
      params: safeParams,
    });

    // Return structured error response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
