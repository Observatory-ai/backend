import { AuthService } from '../auth.service';
import { User } from '../../user/user.entity';
import { UserService } from '../../user/user.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { Config, JwtConfig } from '../../config/configuration.interface';
import { AuthTokenType } from '../configs/cookie.config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return AuthService.getTokenFromRequest(
            request,
            AuthTokenType.Refresh,
          );
        },
      ]),
      secretOrKey: configService.get<JwtConfig>('jwt').refresh.secret,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: TokenPayload): Promise<User> {
    const refreshToken: string = AuthService.getTokenFromRequest(
      request,
      AuthTokenType.Refresh,
    );
    return this.userService.findByEmailAndRefreshToken(
      payload.email,
      refreshToken,
    );
  }
}
