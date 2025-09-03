import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraylogService } from './graylog.service';
import { AppLoggerService } from './app-logger.service';
import { LoggingInterceptor } from './logging.interceptor';
import { AuditLogService } from './audit-log.service';
import { AuditLogInterceptor } from './audit-log.interceptor';
import { AuditLogController } from './audit-log.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Global()
@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [AuditLogController],
  providers: [
    GraylogService,
    AppLoggerService,
    {
      provide: 'AUDIT_LOG_SERVICE',
      useClass: AuditLogService,
    },
    {
      provide: AuditLogService,
      useExisting: 'AUDIT_LOG_SERVICE',
    },
    LoggingInterceptor,
    AuditLogInterceptor,
    PrismaService,
  ],
  exports: [
    GraylogService,
    AppLoggerService,
    LoggingInterceptor,
    AuditLogInterceptor,
    'AUDIT_LOG_SERVICE',
    AuditLogService,
  ],
})
export class LoggingModule {}
