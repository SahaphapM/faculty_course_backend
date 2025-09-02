import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserRole } from 'src/enums/role.enum';

@Injectable()
export class SelfAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) return false;
    
    // Admin can access anything
    if (user.role === UserRole.Admin) return true;
    
    // For self-access, check if user is accessing their own data
    const userId = parseInt(request.params.userId);
    return user.id === userId;
  }
}
