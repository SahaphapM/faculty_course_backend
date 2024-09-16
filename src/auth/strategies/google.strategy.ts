import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { HttpException, Injectable } from '@nestjs/common';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_REDIRECT'),
      scope: ['email', 'profile'],
    });
  }

  authorizationParams(): { [key: string]: string } {
    return {
      prompt: 'consent',
      access_type: 'offline',
    };
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;
    const email: string = emails[0].value;
    const domain: string = email.split('@')[1];

    if (!domain.includes('buu.ac.th')) {
      throw new HttpException(`Invalid domain: ${domain}`, 401);
    }

    const user = {
      id: id,
      email: email,
      name: `${name.givenName} ${name.familyName}`,
      picture: photos[0].value,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}
