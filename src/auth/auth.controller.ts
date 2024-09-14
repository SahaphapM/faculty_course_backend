import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
// import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { GoogleAuthGuard } from './guard/google-auth.guard';
import { Response, Request } from 'express';
import { CheckTokenExpiryGuard } from './CheckTokenExpiryGuard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { access_token, user } = await this.authService.login(req.body);
    // save to cookie
    res.cookie('access_token', access_token, {
      httpOnly: true, // sent to only Serverside
    });
    return { message: 'Login successful', user: user };
  }

  @UseGuards(CheckTokenExpiryGuard)
  @Get('/profile')
  async getProfile(@Req() req) {
    const accessToken = req.cookies['access_token'];
    if (accessToken)
      return (await this.authService.getProfile(accessToken)).data;
    throw new UnauthorizedException('No access token');
  }

  @UseGuards(GoogleAuthGuard)
  @Get('/google')
  googleAuth() {
    // Initiates the Google OAuth process
  }

  @UseGuards(GoogleAuthGuard)
  @Get('/google/redirect')
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const googleToken = req.user.accessToken;
    const googleRefreshToken = req.user.refreshToken;

    res.cookie('access_token', googleToken, { httpOnly: true });
    res.cookie('refresh_token', googleRefreshToken, {
      httpOnly: true,
    });

    // const { access_token } = await this.authService.googleLogin(req);

    // res.cookie('access_token', access_token, {
    //   httpOnly: true,
    // });
    res.redirect(`${process.env.FRONTEND_URL}/auth/google/success`);
    return {
      message: 'Login with Google successful',
      status: 200,
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      // Include other options you used when setting the cookie
      // For example:
      // secure: true,
      // sameSite: 'strict',
      // domain: 'your-domain.com',
      // path: '/',
    });
    return { message: 'Logged out successfully' };
  }
}
