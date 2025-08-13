import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from 'src/enums/role.enum';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor() {
    super({
      // accessType: 'offline', // Only if you need refresh tokens
      // prompt: 'consent',     // REMOVE this line for smoother login
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isUnAuth =
      process.env.UNAUTH === 'true' || process.env.UNAUTH === '1';
    if (isUnAuth) {
      const req = context.switchToHttp().getRequest();
      req.user = req.user ?? {
        id: 0,
        email: 'unauth@example.com',
        avatarUrl: '',
        role: UserRole.Admin,
        name: 'UNAUTH',
      };
      return true;
    }
    const result = await super.canActivate(context);
    return typeof result === 'boolean' ? result : false;
  }
}
