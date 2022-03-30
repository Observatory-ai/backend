import { TokenModule } from './../token/token.module';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { LocalStrategy } from './strategies/local.strategy';
import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthTokenType, COOKIE_CONFIG } from './configs/cookie.config';
import { AuthService } from './auth.service';
import { Config, JwtConfig } from '../config/configuration.interface';

@Global()
@Module({
  imports: [
    UserModule,
    PassportModule,
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
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStrategy],
  exports: [AuthService],
})
export class AuthModule {}
