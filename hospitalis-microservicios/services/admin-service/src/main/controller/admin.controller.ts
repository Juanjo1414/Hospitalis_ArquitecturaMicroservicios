import { Controller, Get, Patch, Delete, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersAdminService, AuditLogService, SystemConfigService } from '../application/admin.service';
import { RolesGuard } from '../domain/roles.guard';
import { Roles } from '../domain/roles.decorator';
import { Role } from '../domain/roles.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly svc: UsersAdminService) {}
  @Get() findAll(@Query('role') role?: string, @Query('isActive') isActive?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.findAll({ role, isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined, page: page ? +page : 1, limit: limit ? +limit : 10 });
  }
  @Get('profile')
  getProfile(@Req() req: any) {
    return this.svc.findOne(req.user.userId);
  }

  @Get(':id') findOne(@Param('id') id: string) { return this.svc.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: any) { return this.svc.update(id, dto); }
  @Delete(':id') @Roles(Role.ADMIN) remove(@Param('id') id: string) { return this.svc.remove(id); }
  @Delete(':id/hard') @Roles(Role.ADMIN) hardDelete(@Param('id') id: string) { return this.svc.hardDelete(id); }
}

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
@Controller('audit')
export class AuditLogsController {
  constructor(private readonly svc: AuditLogService) {}
  @Get() findAll(@Query('userId') userId?: string, @Query('resource') resource?: string, @Query('action') action?: string, @Query('from') from?: string, @Query('to') to?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.findAll({ userId, resource, action, from, to, page: page ? +page : 1, limit: limit ? +limit : 30 });
  }
}

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
@Controller('settings')
export class SystemConfigController {
  constructor(private readonly svc: SystemConfigService) {}
  @Get() get() { return this.svc.get(); }
  @Patch() update(@Body() dto: any) { return this.svc.update(dto); }
}
