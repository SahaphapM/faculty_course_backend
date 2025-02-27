import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import * as argon2 from 'argon2';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import { CreateUserDto } from 'src/generated/nestjs-dto/create-user.dto';
import { LoginDto } from 'src/dto/login.dto';

const USER_NOT_FOUND_MESSAGE = 'User not found!';
const INVALID_CREDENTIALS_MESSAGE = 'Invalid credentials';
const INVALID_REFRESH_TOKEN_MESSAGE = 'Invalid Refresh Token';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}

  async validateUserCredentials(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException(USER_NOT_FOUND_MESSAGE);

    const isPasswordMatch = await compare(dto.password, user.password);
    if (!isPasswordMatch)
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);

    return user;
  }

  async authenticateUser(dto: LoginDto) {
    // First, validate the user credentials
    const user = await this.validateUserCredentials(dto);

    // Then generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.role,
    );
    const hashedRefreshToken = await argon2.hash(refreshToken);

    // Update hashed refresh token in the database
    await this.usersService.updateHashedRefreshToken(
      user.id,
      hashedRefreshToken,
    );

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(userId: number, role: string) {
    const payload: AuthJwtPayload = { sub: userId, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);

    return { accessToken, refreshToken };
  }

  async refreshToken(userId: number, role: string) {
    const { accessToken, refreshToken } = await this.generateTokens(
      userId,
      role,
    );
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

  async validateRefreshToken(userId: number, refreshToken: string) {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.hashedRefreshToken)
      throw new UnauthorizedException(INVALID_REFRESH_TOKEN_MESSAGE);

    const refreshTokenMatches = await argon2.verify(
      user.hashedRefreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches)
      throw new UnauthorizedException(INVALID_REFRESH_TOKEN_MESSAGE);

    return { id: userId };
  }

  async signOut(userId: number) {
    await this.usersService.updateHashedRefreshToken(userId, null);
  }

  async validateJwtUser(userId: number) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new UnauthorizedException(USER_NOT_FOUND_MESSAGE);
    return user;
  }

  async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.usersService.findByEmail(googleUser.email);
    if (user) {
      // If user exists, generate tokens and return them
      return this.generateTokens(user.id, user.role);
    } else {
      // If user does not exist, create a new user and generate tokens
      const newUser = await this.usersService.create(googleUser);
      return this.generateTokens(newUser.id, user.role);
    }
  }
}
