import { Module } from '@nestjs/common';
import { UsersModule } from 'src/modules/users/users.module';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { GoogleStrategy } from './strategies/google.strategy';
import { User } from 'src/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { RolesGuard } from './guard/roles.guard';
import googleOauthConfig from './config/google-oauth.config';
import refreshJwtConfig from './config/refresh-jwt.config';
import jwtConfig from './config/jwt.config';
import { UsersService } from 'src/modules/users/users.service';
import { RefreshJwtStrategy } from './strategies/refresh.strategy';
import { JwtModule } from '@nestjs/jwt';
import { Role } from 'src/entities/role.entity';
import { Student } from 'src/entities/student.entity';
import { Teacher } from 'src/entities/teacher.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Student, Teacher]),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    ConfigModule.forFeature(googleOauthConfig),
    UsersModule,
    PassportModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    // JwtModule.registerAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({
    //     secret: configService.get('JWT_SECRET'),
    //     signOptions: { expiresIn: '8h' },
    //   }),
    //   inject: [ConfigService],
    // }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    UsersService,
    RefreshJwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, //@UseGuards(JwtAuthGuard) applied on all API endppints
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],

  exports: [AuthService],
})
export class AuthModule {}
