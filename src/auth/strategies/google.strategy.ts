import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { ConfigType } from '@nestjs/config';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import googleOauthConfig from '../config/google-oauth.config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(googleOauthConfig.KEY)
    private googleConfiguration: ConfigType<typeof googleOauthConfig>,
    private authService: AuthService,
  ) {
    super({
      clientID: googleConfiguration.clientID,
      clientSecret: googleConfiguration.clientSecret,
      callbackURL: googleConfiguration.callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<any> {
    const { emails, name, photos } = profile;
    const email: string = emails[0].value;
    const domain: string = email.split('@')[1];

    if (!domain.includes('buu.ac.th')) {
      throw new HttpException(`Invalid domain: ${domain}`, 401);
    }
    const user = await this.authService.validateGoogleUser(
      {
        email: email,
        password: '',
        avatarUrl: photos[0].value,
        role: null,
      },
      `${name.givenName} ${name.familyName}`,
    );

    return user;
  }
}
