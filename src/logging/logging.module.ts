import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraylogService } from './graylog.service';
import { AppLoggerService } from './app-logger.service';
import { LoggingInterceptor } from './logging.interceptor';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [GraylogService, AppLoggerService, LoggingInterceptor],
  exports: [GraylogService, AppLoggerService, LoggingInterceptor],
})
export class LoggingModule {}