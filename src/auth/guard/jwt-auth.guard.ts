
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/decorators/public.decorator';
import { UserRole } from 'src/enums/role.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Global bypass for authentication when UNAUTH is enabled
    const isUnAuth =
      process.env.UNAUTH === 'true' || process.env.UNAUTH === '1';
    if (isUnAuth) {
      const req = context.switchToHttp().getRequest();
      // Attach a mock admin user so downstream code relying on req.user doesn't break
      req.user = req.user ?? {
        id: 0,
        email: 'unauth@example.com',
        avatarUrl: '',
        role: UserRole.Admin,
        name: 'UNAUTH',
      };
      return true;
    }
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

  const result = await super.canActivate(context);
  return typeof result === 'boolean' ? result : false;
  }
}
