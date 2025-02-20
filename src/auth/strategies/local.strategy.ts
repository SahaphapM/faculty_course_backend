import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { LoginDto } from 'src/dto/login.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(dto: LoginDto): Promise<any> {
    const user = await this.authService.validateUserCredentials(dto);

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
