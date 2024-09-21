import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payload } from '../payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      // jwtFromRequest: ExtractJwt.fromExtractors([
      //   (request) => {
      //     return request.cookies.access_token;
      //   },
      // ]),
      // ignoreExpiration: false,
      // secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: Payload) {
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  }
}
