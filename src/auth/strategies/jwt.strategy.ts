import { AuthService } from '../auth.service';
import { Injectable } from '@nestjs/common';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Config, JwtConfig } from '../../config/configuration.interface';
import { AuthTokenType } from '../configs/cookie.config';
import { User } from '../../user/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return AuthService.getTokenFromRequest(request, AuthTokenType.Access);
        },
      ]),
      secretOrKey: configService.get<JwtConfig>('jwt').access.secret,
    });
  }

  async validate(payload: TokenPayload): Promise<User> {
    return this.userService.findByEmail(payload.email);
  }
}
