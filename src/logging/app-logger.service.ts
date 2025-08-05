import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { GraylogService } from './graylog.service';

/**
 * Custom application logger that writes directly to console.* methods to avoid
 * Nest's Logger recursion when set via app.useLogger(). It forwards logs
 * to GraylogService for centralized logging.
 */
@Injectable()
export class AppLoggerService implements NestLoggerService {
  constructor(private readonly graylog: GraylogService) {}

  private format(prefix: string | undefined, message: any) {
    const ts = new Date().toISOString();
    const ctx = prefix ? `[${prefix}]` : '';
    const msg = typeof message === 'string' ? message : JSON.stringify(message);
    return `${ts} ${ctx} ${msg}`;
  }

  log(message: any, context?: string) {
    // Write directly to stdout to prevent recursion into Nest Logger
    console.log(this.format(context, message));
    // Forward to Graylog (info)
    this.graylog.info(String(message), { context }).catch(() => void 0);
  }

  error(message: any, trace?: string, context?: string) {
    const formatted = this.format(context, message);
    if (trace) {
      console.error(formatted, '\n', trace);
    } else {
      console.error(formatted);
    }
    const errorObj = new Error(
      typeof message === 'string' ? message : JSON.stringify(message),
    );
    if (trace) errorObj.stack = trace;
    this.graylog
      .error(String(message), errorObj, { context })
      .catch(() => void 0);
  }

  warn(message: any, context?: string) {
    console.warn(this.format(context, message));
    this.graylog.warn(String(message), { context }).catch(() => void 0);
  }

  debug(message: any, context?: string) {
    console.debug(this.format(context, message));
    this.graylog.debug(String(message), { context }).catch(() => void 0);
  }

  verbose(message: any, context?: string) {
    console.log(this.format(context, `[VERBOSE] ${message}`));
    this.graylog
      .debug(String(message), { level: 'debug', context })
      .catch(() => void 0);
  }
}
