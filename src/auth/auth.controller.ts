import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guard/google-auth.guard';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { RefreshAuthGuard } from './guard/refresh-auth.guard';
import { Public } from '../decorators/public.decorator';
import { LoginDto } from 'src/dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/login')
  async login(@Body() dto: LoginDto) {
    const { accessToken, refreshToken, user } =
      await this.authService.authenticateUser(dto);

    // Optionally set the access token in a cookie
    // res.cookie('access_token', accessToken, { httpOnly: true });

    return {
      statusCode: 200,
      message: 'Login successful',
      user,
      accessToken,
      refreshToken,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(@Req() req) {
    return req.user;
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
  async googleAuthRedirect(@Req() req, @Res() res) {
    const googleUser = req.user; // Assuming req.user contains Google user info

    // Call a service method to handle Google user creation or retrieval
    const response = await this.authService.validateGoogleUser(googleUser);

    // Redirect to the frontend with the access token
    res.redirect(`${process.env.FRONTEND_URL}?token=${response.accessToken}`);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refreshToken(@Req() req) {
    return this.authService.refreshToken(req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout/:id')
  async signOut(@Param('id') id: number) {
    await this.authService.signOut(id);
    return { message: 'Logout successful' };
  }
}
