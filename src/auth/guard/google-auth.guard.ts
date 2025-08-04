import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor() {
    super({
      // accessType: 'offline', // Only if you need refresh tokens
      // prompt: 'consent',     // REMOVE this line for smoother login
    });
  }
}
