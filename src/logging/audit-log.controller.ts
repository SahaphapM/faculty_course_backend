import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole as Role } from 'src/enums/role.enum';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { SelfAccessGuard } from 'src/auth/guard/self-access.guard';
import { AuditLog } from './audit-log.decorator';
import { AuditLogQueryDto } from 'src/dto/filters/filter.audit-log.dto';

@Controller('audit-logs')
@UseGuards(RolesGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles(Role.Admin)
  @AuditLog({ action: 'READ', resource: 'audit_log', includeRequest: true })
  async getAuditLogs(@Query() query: AuditLogQueryDto) {
    return this.auditLogService.getLogs(query);
  }

  @Get('resources')
  @AuditLog({ action: 'READ', resource: 'audit_log', includeRequest: true })
  async getResources() {
    return this.auditLogService.getTables();
  }

  @Get(':id')
  @Roles(Role.Admin)
  @AuditLog({ action: 'READ', resource: 'audit_log', includeRequest: true })
  async getLogById(@Param('id') id: number) {
    return this.auditLogService.getLogById(id);
  }

  @Get('user/:userId')
  @UseGuards(SelfAccessGuard)
  @AuditLog({ action: 'READ', resource: 'audit_log', includeRequest: true })
  async getUserAuditLogs(
    @Param('userId') userId: number,
    @Query() query: AuditLogQueryDto,
  ) {
    return this.auditLogService.getUserLogs(userId, query);
  }
}
