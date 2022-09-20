import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { User } from "../../user/user.entity";
import { AuthService } from "../auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: "emailOrUsername" });
  }

  async validate(emailOrUsername: string, password: string): Promise<User> {
    return this.authService.validateLocalAuth(emailOrUsername, password);
  }
}
