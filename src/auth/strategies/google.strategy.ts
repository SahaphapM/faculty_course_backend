import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigType } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
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

  // authorizationParams(): { [key: string]: string } {
  //   return {
  //     prompt: 'consent',
  //     access_type: 'offline',
  //   };
  // }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    // const { emails } = profile;
    // const email: string = emails[0].value;
    // const domain: string = email.split('@')[1];

    // if (!domain.includes('buu.ac.th')) {
    //   throw new HttpException(`Invalid domain: ${domain}`, 401);
    // }

    // const user = {
    //   id: id,
    //   email: email,
    //   name: `${name.givenName} ${name.familyName}`,
    //   picture: photos[0].value,
    // };

    const user = await this.authService.validateGoogleUser({
      email: profile.emails[0].value,
      password: '',
      avatarUrl: profile.photos[0].value,
      role: null,
    });

    const payload = { ...user, name: `${profile.name.givenName} ${profile.name.familyName}` };
    done(null, payload);
  }
}
