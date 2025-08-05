import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';
import { LoggingInterceptor } from './logging/logging.interceptor';
import { AppLoggerService } from './logging/app-logger.service';
import { AuditLogInterceptor } from './logging/audit-log.interceptor';
import { AuditLogDecoratorInterceptor } from './logging/audit-log-decorator.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Use custom logger that forwards to Graylog
  app.useLogger(app.get(AppLoggerService));

  app.enableCors({
    origin: ['http://localhost:5173', 'http://skillmap.informatics.buu.ac.th'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      // whitelist: true,
      // forbidNonWhitelisted: true,
    }),
  );

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  // Global HTTP logging interceptor
  app.useGlobalInterceptors(
    app.get(LoggingInterceptor),
    app.get(AuditLogInterceptor),
    app.get(AuditLogDecoratorInterceptor)
  );

  const config = new DocumentBuilder()
    .setTitle('BUU APIs')
    .setDescription('The API description')
    .setVersion('0.4')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
