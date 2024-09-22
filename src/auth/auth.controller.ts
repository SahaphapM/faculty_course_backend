import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { GoogleAuthGuard } from './guard/google-auth.guard';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { RefreshAuthGuard } from './guard/refresh-auth.guard';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Req() req) {
    // const { access_token, user } = await this.authService.login(req.body);
    // save to cookie
    // res.cookie('access_token', access_token, {
    //   httpOnly: true, // sent to only Serverside
    // });
    // return { message: 'Login successful', user: user };
    return this.authService.login(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(@Req() req) {
    return req.user;
    // const accessToken = req.cookies['access_token'];
    // if (accessToken) {
    //   return;
    // }
    // throw new UnauthorizedException('No access token');
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('/google')
  googleLogin() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('/google/redirect')
  async googleAuthRedirect(@Req() req, @Res() res) {
    // const googleToken = req.user.accessToken;
    // const googleRefreshToken = req.user.refreshToken;

    // res.cookie('access_token', googleToken, {
    //   httpOnly: true,
    //   sameSite: 'none',
    //   secure: false,
    // });
    // res.cookie('refresh_token', googleRefreshToken, {
    //   httpOnly: true,
    //   sameSite: 'none',
    //   secure: false,
    // });

    // const { access_token } = await this.authService.googleLogin(req);

    // res.cookie('access_token', access_token, {
    //   httpOnly: true,
    // });
    // res.redirect(`${process.env.FRONTEND_URL}/auth/google/success`);
    // return {
    //   message: 'Login with Google successful',
    //   status: 200,
    // };

    const response = await this.authService.login(req.user.id);
    res.redirect(`${process.env.FRONTEND_URL}?token=${response.accessToken}`);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(@Req() req) {
    return this.authService.refreshToken(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  signOut(@Req() req) {
    this.authService.signOut(req.user.id);
  }

  // @Get('logout')
  // logout(@Req() req, @Res() res: Response) {
  //   // const refreshToken = req.cookies['refresh_token'];
  //   // res.clearCookie('access_token');
  //   // res.clearCookie('refresh_token');
  //   // this.authService.revokeGoogleToken(refreshToken);
  //   res.redirect(`${process.env.FRONTEND_URL}`);
  // }
}
