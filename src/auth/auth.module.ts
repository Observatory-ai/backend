import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Config, JwtConfig } from '../config/configuration.interface';
import { UserModule } from '../user/user.module';
import { TokenModule } from './../token/token.module';
import { AuthTokenRepository } from './auth-token.repository';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { AuthTokenType, COOKIE_CONFIG } from './configs/cookie.config';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Global()
@Module({
  imports: [
    UserModule,
    PassportModule,
    TypeOrmModule.forFeature([AuthTokenRepository]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<Config>) => ({
        secret: configService.get<JwtConfig>('jwt').access.secret,
        signOptions: {
          expiresIn: COOKIE_CONFIG[AuthTokenType.Access].expirationTime,
        },
      }),
    }),
    TokenModule,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStrategy, AuthResolver],
  exports: [AuthService],
})
export class AuthModule {}
