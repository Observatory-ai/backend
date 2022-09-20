import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { RequestWithUserAndAccessToken } from "src/utils/requests.interface";
import { Config, JwtConfig } from "../../config/configuration.interface";
import { User } from "../../user/user.entity";
import { AuthService } from "../auth.service";
import { TokenPayload } from "../interfaces/token-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<JwtConfig>("jwt").access.secret,
      passReqToCallback: true,
    });
  }

  async validate(
    request: RequestWithUserAndAccessToken,
    tokenPayload: TokenPayload,
  ): Promise<User> {
    return this.authService.validateJWT(request, tokenPayload);
  }
}
