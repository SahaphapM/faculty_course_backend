import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // Default
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error';

    // Unique constraint
    if (exception.code === 'P2002') {
      status = HttpStatus.CONFLICT;
      message = 'Duplicate value violates a unique constraint.';
    }

    // Foreign key constraint failed
    if (exception.code === 'P2003') {
      status = HttpStatus.CONFLICT; // 409 เหมาะสุดสำหรับ FK block
      // Prisma จะมี meta เช่น field_name / model_name / target แล้วแต่เคส
      const meta = (exception.meta || {}) as Record<string, any>;
      const field = meta.field_name || meta.model_name || meta.target || '';
      message = `Delete blocked by foreign key constraint${field ? ` on ${field}` : ''}. Please detach or archive dependents first.`;
    }

    // Record not found on update/delete
    if (exception.code === 'P2025') {
      status = HttpStatus.NOT_FOUND;
      message = 'Record not found.';
    }

    response.status(status).json({
      statusCode: status,
      error: 'PrismaError',
      code: exception.code,
      message,
      meta: exception.meta ?? undefined,
    });
  }
}
