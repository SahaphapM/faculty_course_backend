import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { compare } from '@node-rs/bcrypt';
import { hash as bcryptHash, compare as bcryptCompare } from '@node-rs/bcrypt';
import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import { CreateUserDto } from 'src/generated/nestjs-dto/create-user.dto';
import { LoginDto } from 'src/dto/login.dto';
import { UserRole } from 'src/enums/role.enum';
import { StudentsService } from 'src/modules/students/students.service';
import e from 'express';

export interface JwtPayload {
  id: number;
}

export type PayloadUser = {
  id: number;
  accessToken: string;
  refreshToken: string;
};

const USER_NOT_FOUND_MESSAGE = 'User not found!';
const INVALID_CREDENTIALS_MESSAGE = 'Invalid credentials';
const INVALID_REFRESH_TOKEN_MESSAGE = 'Invalid Refresh Token';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly studentService: StudentsService, // Injected directly from StudentsModule
    private readonly jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private readonly refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}

  async validateUserCredentials(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email, {
      id: true,
      email: true,
      password: true,
      role: true,
    });

    // Avoid user enumeration: always use Unauthorized for invalid credentials
    if (!user || !user.password) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const isPasswordMatch = await compare(dto.password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    return user;
  }

  async authenticateUser(dto: LoginDto): Promise<PayloadUser> {
    // First, validate the user credentials
    const user = await this.validateUserCredentials(dto);

    // Then generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id);
    const hashedRefreshToken = await bcryptHash(refreshToken);

    // Update hashed refresh token in the database
    await this.usersService.updateHashedRefreshToken(
      user.id,
      hashedRefreshToken,
    );

    return {
      id: user.id,
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(userId: number) {
    const payload: JwtPayload = { id: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);

    return { accessToken, refreshToken };
  }

  async refreshToken(userId: number) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashedRefreshToken = await bcryptHash(refreshToken);
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
    const user = await this.usersService.findOneById(userId);
    if (!user?.hashedRefreshToken)
      throw new UnauthorizedException(INVALID_REFRESH_TOKEN_MESSAGE);

    const refreshTokenMatches = await bcryptCompare(
      refreshToken,
      user.hashedRefreshToken,
    );
    if (!refreshTokenMatches)
      throw new UnauthorizedException(INVALID_REFRESH_TOKEN_MESSAGE);

    return { id: userId };
  }

  async signOut(userId: number) {
    await this.usersService.updateHashedRefreshToken(userId, null);
  }

  async validateJwtUser(userId: number) {
    const user = await this.usersService.findOneById(userId);
    if (!user) throw new UnauthorizedException(USER_NOT_FOUND_MESSAGE);
    return user;
  }

  async validateGoogleUser(
    googleUser: CreateUserDto,
    _name: string,
  ): Promise<PayloadUser> {
    const user = await this.usersService.findByEmail(googleUser.email);
    if (user) {
      // If user exists, generate tokens and return them
      const { accessToken, refreshToken } = await this.generateTokens(user.id);
      return {
        ...user,
        accessToken,
        refreshToken,
      };
    } else {
      const code = googleUser.email.split('@')[0];
      const isNumeric = /^\d+$/.test(code);
      console.log('Is numeric:', code);

      // Create the user first
      const newUser = await this.usersService.create({
        ...googleUser,
        role: isNumeric ? UserRole.Student : UserRole.Instructor,
      });

      if (isNumeric) {
        // find student by code
        let student = await this.studentService.findOne(code);
        if (!student) {
          // If student, create student record and link to user
          const createdStudent = await this.studentService.create({
            code: code,
            userId: newUser.id,
          });
          // Fetch the complete student object with required properties
          student = await this.studentService.findOne(createdStudent.code);
        } else if (!student.userId) {
          // If student exists but not linked to user, link it
          await this.studentService.update(student.id, { userId: newUser.id });
        }
        console.log('Linked student:', student);

        // Optionally update the user with studentId
        const user = await this.usersService.updateStudentId(newUser.id, {
          studentId: student.id,
        });
        console.log('Updated user with studentId:', user);
      }

      const { accessToken, refreshToken } = await this.generateTokens(
        newUser.id,
      );

      return {
        ...newUser,
        accessToken,
        refreshToken,
      };
    }
  }
}
