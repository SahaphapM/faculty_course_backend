import { Controller, Get, Post, Request, Res, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { GoogleAuthGuard } from './guard/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Request() req, @Res({ passthrough: true }) res) {
    const { access_token, user } = await this.authService.login(req.user);
    // save to cookie
    res.cookie('access_token', access_token, {
      // httpOnly: true, // sent to only Serverside
      // secure: process.env.NODE_ENV === 'production', // ensure it's secure in production
      // sameSite: 'strict',
    });
    return { message: 'Login successful', user: user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google')
  async googleAuth(@Request() req) {
    // Initiates the Google OAuth process
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/redirect')
  async googleAuthRedirect(@Request() req, @Res({ passthrough: true }) res) {
    const { access_token } = await this.authService.googleLogin(req);
    // save to cookie
    res.cookie('access_token', access_token, {
      httpOnly: true, // sent to only Serverside
    });
    console.log(access_token);
    return { message: 'Login with Google successful' };
  }
}
