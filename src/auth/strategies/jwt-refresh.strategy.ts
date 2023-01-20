import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Config, JwtConfig } from '../../config/configuration.interface';
import { User } from '../../user/user.entity';
import { AuthService } from '../auth.service';
import { TokenPayload } from '../interfaces/token-payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return AuthService.getRefreshTokenFromRequest(request);
        },
      ]),
      secretOrKey: configService.get<JwtConfig>('jwt').refresh.secret,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: TokenPayload): Promise<User> {
    console.log('in strategy');
    return this.authService.validateJWTRefresh(request, payload);
  }
}
