import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
// import { User } from 'src/users/entities/user.entity';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Payload } from './types/payload';
import { compare } from 'bcrypt';
import * as argon2 from 'argon2';
import { ProfilePayload } from './types/current-user';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import { CreateUserDto } from 'src/generated/nestjs-dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    // @InjectRepository(User)
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found!');
    const isPasswordMatch = await compare(password, user.password);
    if (!isPasswordMatch)
      throw new UnauthorizedException('Invalid credentials');

    return { id: user.id };
  }

  async login(userId: number) {
    // const payload: AuthJwtPayload = { sub: userId };
    // const token = this.jwtService.sign(payload);
    // const refreshToken = this.jwtService.sign(payload, this.refreshTokenConfig);
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.usersService.updateHashedRefreshToken(
      userId,
      hashedRefreshToken,
    );
    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(userId: number) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.usersService.updateHashedRefreshToken(
      userId,
      hashedRefreshToken,
    );
    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }

  // google
  // async googleLogin(req): Promise<any> {
  //   if (!req.user) {
  //     throw new Error('Google login failed: No user information received.');
  //   }
  //   const payload: Payload = {
  //     id: req.user.id,
  //     email: req.user.email,
  //     name: req.user.name,
  //     picture: req.user.picture,
  //   };
  //   return {
  //     access_token: this.jwtService.sign(payload),
  //   };
  // }

  async validateRefreshToken(userId: number, refreshToken: string) {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.hashedRefreshToken)
      throw new UnauthorizedException('Invalid Refresh Token');

    const refreshTokenMatches = await argon2.verify(
      user.hashedRefreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches)
      throw new UnauthorizedException('Invalid Refresh Token');

    return { id: userId };
  }

  async signOut(userId: number) {
    await this.usersService.updateHashedRefreshToken(userId, null);
  }

  async validateJwtUser(userId: number) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found!');
    const currentUser: ProfilePayload = {
      id: user.id,
      role: user.role,
      email: user.email,
      avatarUrl: user.avatarUrl,
    };
    return currentUser;
  }

  async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.usersService.findByEmail(googleUser.email);
    if (user) return user;
    return await this.usersService.create(googleUser);
  }

  // async getGProfile(token: string) {
  //   try {
  //     return axios.get(
  //       `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`,
  //     );
  //   } catch (error) {
  //     console.error('Failed to revoke the token:', error);
  //   }
  // }

  // async getNewAccessToken(refreshToken: string): Promise<string> {
  //   try {
  //     const response = await axios.post(
  //       'https://accounts.google.com/o/oauth2/token',
  //       {
  //         client_id: process.env.GOOGLE_CLIENT_ID,
  //         client_secret: process.env.GOOGLE_CLIENT_SECRET,
  //         refresh_token: refreshToken,
  //         grant_type: 'refresh_token',
  //       },
  //     );

  //     return response.data.access_token;
  //   } catch (error) {
  //     throw new Error('Failed to refresh the access token.');
  //   }
  // }

  // async isTokenExpired(token: string): Promise<boolean> {
  //   try {
  //     const response = await axios.get(
  //       `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`,
  //     );

  //     const expiresIn = response.data.expires_in;

  //     if (!expiresIn || expiresIn <= 0) {
  //       return true;
  //     }
  //   } catch (error) {
  //     return true;
  //   }
  // }

  // async revokeGoogleToken(token: string) {
  //   try {
  //     await axios.get(
  //       `https://accounts.google.com/o/oauth2/revoke?token=${token}`,
  //     );
  //   } catch (error) {
  //     console.error('Failed to revoke the token:', error);
  //   }
  // }
}
