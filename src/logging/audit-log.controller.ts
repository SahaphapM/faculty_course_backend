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

@Controller('audit-logs')
@UseGuards(RolesGuard)
@Roles(Role.Admin)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @UseInterceptors(AuditLogDecoratorInterceptor)
  @AuditLog({ action: 'READ', resource: 'audit_log', includeRequest: true })
  async getAuditLogs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('userId') userId?: number,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};

    if (userId) filters.userId = Number(userId);
    if (action) filters.action = action;
    if (resource) filters.resource = resource;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    return this.auditLogService.getLogs(Number(page), Number(limit), filters);
  }
}