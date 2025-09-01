import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggingInterceptor } from './logging/logging.interceptor';
import { AppLoggerService } from './logging/app-logger.service';
import { AuditLogInterceptor } from './logging/audit-log.interceptor';
import { AuditLogDecoratorInterceptor } from './logging/audit-log-decorator.interceptor';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Prisma exception filter to handle database errors
  app.useGlobalFilters(new PrismaExceptionFilter());

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
      whitelist: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global HTTP logging interceptor
  app.useGlobalInterceptors(
    app.get(LoggingInterceptor),
    app.get(AuditLogInterceptor),
    app.get(AuditLogDecoratorInterceptor),
  );

  // If UNAUTH is true, disable Swagger security to bypass authorization in Swagger UI
  const isUnAuth = process.env.UNAUTH === 'true' || process.env.UNAUTH === '1';

  const swaggerBuilder = new DocumentBuilder()
    .setTitle('BUU APIs')
    .setDescription('The API description')
    .setVersion('0.4');

  if (!isUnAuth) {
    swaggerBuilder.addBearerAuth();
  }

  const config = swaggerBuilder.build();
  const document: any = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });

  if (isUnAuth) {
    // Remove global and per-operation security requirements
    if (document.components) {
      document.components.securitySchemes = {};
    }
    document.security = [];
    const methods = [
      'get',
      'put',
      'post',
      'delete',
      'options',
      'head',
      'patch',
      'trace',
    ];
    if (document.paths) {
      Object.values(document.paths).forEach((pathItem: any) => {
        methods.forEach((m) => {
          if (pathItem?.[m]?.security) {
            delete pathItem[m].security;
          }
        });
      });
    }
  }

  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
