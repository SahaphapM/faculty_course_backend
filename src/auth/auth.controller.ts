import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guard/google-auth.guard';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { RefreshAuthGuard } from './guard/refresh-auth.guard';
import { Public } from '../decorators/public.decorator';
import { LoginDto } from 'src/dto/login.dto';
import type { ProfilePayload } from './types/current-user.d.ts';
import { CreateUserDto } from 'src/generated/nestjs-dto/create-user.dto';
import { UserService } from 'src/modules/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService, // Injected directly from UsersModule
  ) {}

  @Public()
  @Post('/login')
  async login(@Body() dto: LoginDto) {
    const response = await this.authService.authenticateUser(dto);

    // Optionally set the access token in a cookie
    // res.cookie('access_token', accessToken, { httpOnly: true });

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(@Req() req) {
  return await this.userService.findOneById(req.user.id);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('/google')
  googleLogin() {
    // Initiate Google login flow
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('/google/redirect')
  async googleAuthRedirect(
    @Req() req: Request & { user: ProfilePayload },
    @Res() res: Response,
  ) {
    try {
      const googleUser = req.user; // req.user is now type-safe as ProfilePayload

      // Convert ProfilePayload to CreateUserDto format for the service method
      const userDto: CreateUserDto = {
        email: googleUser.email,
        password: '', // Google OAuth doesn't use password
        avatarUrl: googleUser.avatarUrl,
        role: googleUser.role,
      };

      // Call a service method to handle Google user creation or retrieval
      const response = await this.authService.validateGoogleUser(
        userDto,
        googleUser.name,
      );

      // Redirect to the frontend with the access token
      const url = `${process.env.FRONTEND_URL}/google/redirect/?token=${response.accessToken}`;
      res.redirect(url);
    } catch (error) {
      console.error('Google OAuth error:', error);
      // Redirect to the frontend with an error message
      res.redirect(`${process.env.FRONTEND_URL}?error=Google OAuth failed`);
    }
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refreshToken(@Req() req) {
    return this.authService.refreshToken(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout/:id')
  async signOut(@Param('id') id: number) {
    await this.authService.signOut(id);
    return { message: 'Logout successful' };
  }
}
