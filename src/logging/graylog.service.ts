import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type LogLevel = 'info' | 'error' | 'warn' | 'debug';

interface GraylogOptions {
  host: string;
  port?: number;
  protocol: 'http' | 'udp';
  appName: string;
  environment: string;
  level: LogLevel;
}

interface LogPayload {
  short_message: string;
  full_message?: string;
  level?: number;
  _context?: Record<string, any>;
  timestamp?: number;
  host?: string;
  version?: string;
}

const levelToSyslog: Record<LogLevel, number> = {
  // Syslog severity: 7=debug, 6=info, 4=warn, 3=error
  debug: 7,
  info: 6,
  warn: 4,
  error: 3,
};

@Injectable()
export class GraylogService {
  private readonly logger = new Logger(GraylogService.name);
  private readonly opts: GraylogOptions;
  private udpClient: any | null = null;

  constructor(private readonly config: ConfigService) {
    const protocol = (
      this.config.get<string>('GRAYLOG_PROTOCOL') || 'http'
    ).toLowerCase() as 'http' | 'udp';
    const host = this.config.get<string>('GRAYLOG_HOST') || '';
    const port = Number(
      this.config.get<string>('GRAYLOG_PORT') ||
        (protocol === 'udp' ? 12201 : 80),
    );
    const appName =
      this.config.get<string>('GRAYLOG_APP') || 'faculty-course-backend';
    const environment = this.config.get<string>('NODE_ENV') || 'development';
    const level = (
      this.config.get<string>('LOG_LEVEL') || 'info'
    ).toLowerCase() as LogLevel;

    this.opts = { host, port, protocol, appName, environment, level };

    if (!this.opts.host) {
      this.logger.warn(
        'GRAYLOG_HOST is not configured. Logs will not be sent to Graylog.',
      );
    }

    if (this.opts.protocol === 'udp' && this.opts.host) {
      try {
        // Lazy import dgram to avoid dependency issues when unused
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const dgram = require('dgram');
        this.udpClient = dgram.createSocket('udp4');
      } catch (e) {
        this.logger.error('Failed to initialize UDP client for Graylog');
      }
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const order: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return order.indexOf(level) >= order.indexOf(this.opts.level);
  }

  private baseFields() {
    return {
      host: this.opts.appName,
      version: '1.1',
      _app: this.opts.appName,
      _env: this.opts.environment,
    };
  }

  private async send(payload: LogPayload) {
    if (!this.opts.host) return; // no-op if graylog not configured

    const enriched: LogPayload = {
      ...this.baseFields(),
      timestamp: payload.timestamp ?? Date.now() / 1000,
      ...payload,
    };

    if (this.opts.protocol === 'http') {
      const url = `http://${this.opts.host}${this.opts.port ? ':' + this.opts.port : ''}/gelf`;
      try {
        // Lazy import fetch for Node18+ or use node-fetch if needed
        let fetchFn: any = (global as any).fetch;
        if (!fetchFn) {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          fetchFn = require('node-fetch');
        }
        await fetchFn(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(enriched),
        });
      } catch (e) {
        this.logger.error(`Graylog HTTP send failed: ${(e as Error).message}`);
      }
    } else if (this.opts.protocol === 'udp' && this.udpClient) {
      try {
        const message = Buffer.from(JSON.stringify(enriched));
        await new Promise<void>((resolve, reject) => {
          this.udpClient.send(
            message,
            0,
            message.length,
            this.opts.port!,
            this.opts.host,
            (err: any) => {
              if (err) reject(err);
              else resolve();
            },
          );
        });
      } catch (e) {
        this.logger.error(`Graylog UDP send failed: ${(e as Error).message}`);
      }
    }
  }

  private sanitizeHeaders(headers: Record<string, any> = {}) {
    const allowedHeaders = [
      'host',
      //   'user-agent', // รกเกินไป
      //   'accept',
      'origin',
      //   'referer',
    ];
    const sanitized: Record<string, any> = {};

    for (const key of allowedHeaders) {
      if (headers[key]) sanitized[key] = headers[key];
    }

    // if (headers.authorization) {
    //   sanitized.authorization = '[PRIVATE]';
    // }

    if (headers.cookie) {
      sanitized.cookie = '[PRIVATE]';
    }

    return sanitized;
  }

  private sanitizeContext(context: Record<string, any> = {}) {
    if (!context.headers) return context;
    return {
      ...context,
      headers: this.sanitizeHeaders(context.headers),
    };
  }

  private formatError(error?: unknown) {
    if (!error) return undefined;
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }
    return { value: error };
  }

  async log(
    level: LogLevel,
    shortMessage: string,
    context?: Record<string, any>,
    error?: unknown,
  ) {
    if (!this.shouldLog(level)) return;

    const sanitizedContext = this.sanitizeContext(context || {});

    if (this.opts.environment === 'development') {
      console.log(
        `[Graylog:${level}]`,
        shortMessage,
        sanitizedContext || '',
        error || '',
      );
    } else {
      console.log(
        JSON.stringify({
          level,
          message: shortMessage,
          ...sanitizedContext,
          error: this.formatError(error),
          timestamp: new Date().toISOString(),
        }),
      );
    }
    if (!this.opts.host) return; // ถ้าไม่มี host ก็ไม่ส่งต่อ

    const payload: LogPayload = {
      short_message: shortMessage,
      level: levelToSyslog[level],
      _context: {
        level,
        ...context,
        error: this.formatError(error),
      },
    };

    await this.send(payload);
  }

  async info(message: string, context?: Record<string, any>) {
    return this.log('info', message, context);
  }

  async warn(message: string, context?: Record<string, any>) {
    return this.log('warn', message, context);
  }

  async debug(message: string, context?: Record<string, any>) {
    return this.log('debug', message, context);
  }

  async error(message: string, error?: unknown, context?: Record<string, any>) {
    return this.log('error', message, context, error);
  }
}
