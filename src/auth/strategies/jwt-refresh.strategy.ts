import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Config, JwtConfig } from "../../config/configuration.interface";
import { User } from "../../user/user.entity";
import { UserService } from "../../user/user.service";
import { AuthService } from "../auth.service";
import { TokenPayload } from "../interfaces/token-payload.interface";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh",
) {
  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return AuthService.getRefreshTokenFromRequest(request);
        },
      ]),
      secretOrKey: configService.get<JwtConfig>("jwt").refresh.secret,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: TokenPayload): Promise<User> {
    const refreshToken: string =
      AuthService.getRefreshTokenFromRequest(request);
    // refresh refresh token with token rotation
    // refresh access token
    return new User();
    // return this.userService.findByEmailAndRefreshToken(
    //   payload.email,
    //   refreshToken,
    // );
  }
}
