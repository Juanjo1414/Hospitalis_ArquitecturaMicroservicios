import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core'; import { Role } from './roles.enum'; import { ROLES_KEY } from './roles.decorator';
@Injectable() export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (!roles?.length) return true;
    const { user } = ctx.switchToHttp().getRequest();
    if (!roles.some(r => user?.role === r)) throw new ForbiddenException('Acceso denegado');
    return true;
  }
}
