import { Controller, Get, Request, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Request as ExpressRequest } from "express";
import { UserResponseDto } from "../auth/dtos/responses/user-response.dto";
import { ReqUser } from "../decorators/user.decorator";
import { GoogleUserDto } from "./dtos/google-user.dto";
import { GoogleAuthService } from "./google-auth.service";
import GoogleGuard from "./guards/google.guard";

@Controller("api/auth")
@ApiTags("Google Authentication")
export class GoogleAuthController {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  @Get("google")
  @UseGuards(GoogleGuard)
  async googleAuth(@Request() request: ExpressRequest) {}

  @Get("google/callback")
  @UseGuards(GoogleGuard)
  googleAuthRedirect(
    @Request() request: ExpressRequest,
    @ReqUser() user: GoogleUserDto,
  ): Promise<UserResponseDto> {
    return this.googleAuthService.authenticate(user, request);
  }
}
