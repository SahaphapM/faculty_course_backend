import {
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole as Role } from 'src/enums/role.enum';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { AuditLogDecoratorInterceptor } from './audit-log-decorator.interceptor';
import { AuditLog } from './audit-log.decorator';
import { AuditLogQueryDto } from 'src/dto/filters/filter.audit-log.dto';

@Controller('audit-logs')
@UseGuards(RolesGuard)
@Roles(Role.Admin)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @UseInterceptors(AuditLogDecoratorInterceptor)
  @AuditLog({ action: 'READ', resource: 'audit_log', includeRequest: true })
  async getAuditLogs(@Query() query: AuditLogQueryDto) {
    return this.auditLogService.getLogs(query);
  }

  @Get('resources')
  @UseInterceptors(AuditLogDecoratorInterceptor)
  @AuditLog({ action: 'READ', resource: 'audit_log', includeRequest: true })
  async getResources() {
    return this.auditLogService.getTables();
  }
}
