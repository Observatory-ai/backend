import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Request as ExpressRequest } from "express";
import { AuditActionDto } from "../audit/enum/audit-action.enum";
import { AuditResourceDto } from "../audit/enum/audit-resource.enum";
import { Audit } from "../decorators/audit.decorator";
import { ReqUser } from "../decorators/user.decorator";
import { ExceptionDto } from "../exception/dto/exception.dto";
import { CreateUserDto } from "../user/dto/create-user.dto";
import { AuthMethod } from "../user/enum/auth-method.enum";
import { Locale } from "../user/enum/locale.enum";
import { User } from "../user/user.entity";
import { RequestWithAccessToken } from "../utils/requests.interface";
import { AuthService } from "./auth.service";
import { ChangePasswordDto } from "./dtos/change-password.dto";
import { ForgotPasswordDto } from "./dtos/forgot-password.dto";
import { UserResponseDto } from "./dtos/responses/user-response.dto";
import { SignInDto } from "./dtos/sign-in.dto";
import { SignUpDto } from "./dtos/sign-up.dto";
import { VerifyAccountDto } from "./dtos/verify-account.dto";
import { JwtAuthenticationGuard } from "./guards/jwt-authentication.guard";
import JwtRefreshGuard from "./guards/jwt-refresh-authentication.guard";
import { LocalAuthenticationGuard } from "./guards/local-authentication.guard";

@Controller("api/auth")
@ApiTags("Local Authentication")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Create a new account
   * @param signUpDto the user to create
   */
  @Post("register")
  @ApiOperation({ summary: "Create a new account" })
  @ApiCreatedResponse({
    description: "The users account has been successfully created",
  })
  @ApiBadRequestResponse({
    description: "The supplied email was in use",
    type: ExceptionDto,
  })
  @ApiBody({ type: SignUpDto })
  register(
    @Request() request: ExpressRequest,
    @Body() signUpDto: SignUpDto,
  ): Promise<UserResponseDto> {
    // use plainToInstance
    let createUserDto: CreateUserDto = {
      email: signUpDto.email,
      username: signUpDto.username,
      firstName: signUpDto.firstName,
      lastName: signUpDto.lastName,
      avatar: null,
      password: signUpDto.password,
      uuid: null,
      googleId: null,
      isVerified: false,
      authMethod: AuthMethod.Local,
      locale: Locale.en_CA, // change to acceptLanguage
    };
    return this.authService.register(request, createUserDto);
  }

  /**
   * Log in
   * @param request the request
   * @param user the user (user is injected by the LocalAuthenticationGuard (local strategy))
   */
  @Post("login")
  @ApiCookieAuth()
  @UseGuards(LocalAuthenticationGuard)
  @Audit(AuditActionDto.LogIn, AuditResourceDto.User)
  @ApiOperation({ summary: "Log in" })
  @ApiCreatedResponse({
    description: "The user has been successfully logged in",
  })
  @ApiBadRequestResponse({
    description: "The supplied email and/or password were invalid",
    type: ExceptionDto,
  })
  @ApiForbiddenResponse({
    description: "The user with the given email was disabled or not verified",
    type: ExceptionDto,
  })
  @ApiNotFoundResponse({
    description: "The user with the given email was not found",
    type: ExceptionDto,
  })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ExceptionDto })
  @ApiBody({ type: SignInDto })
  logIn(
    @Request() request: ExpressRequest,
    @ReqUser() user: User,
  ): Promise<UserResponseDto> {
    return this.authService.logIn(user, request);
  }

  @Get("test")
  @UseGuards(JwtAuthenticationGuard)
  async test(
    @Request() request: RequestWithAccessToken,
    @ReqUser() user: User,
  ): Promise<any> {
    return { user, accessToken: request.accessToken };
  }

  /**
   * Sign out
   * @param request the request
   * @param user the user
   */
  @Post("logout")
  @UseGuards(JwtAuthenticationGuard)
  @Audit(AuditActionDto.LogOut, AuditResourceDto.User)
  @ApiCookieAuth()
  @ApiOperation({ summary: "Sign out" })
  @ApiOkResponse({ description: "The user has been successfully logged out" })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ExceptionDto })
  async logOut(
    @Request() request: ExpressRequest,
    @ReqUser() user: User,
  ): Promise<void> {
    return this.authService.logOut(request, user);
  }

  /**
   * Refresh a users access and refresh tokens
   * @param request the request
   * @param user the user
   */
  @Get("refresh")
  @ApiCookieAuth()
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: "Refresh a users access and refresh tokens" })
  @ApiCreatedResponse({
    description:
      "The new access and refresh tokens were successfully refreshed",
  })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ExceptionDto })
  async refreshToken(
    @Request() request: ExpressRequest,
    @ReqUser() user: User,
  ): Promise<string> {
    return this.authService.refreshToken(user, request);
  }

  /**
   * Request a change password email
   * @param forgotPasswordDto the forgot password information
   */
  @Post("forgot-password")
  @ApiOperation({ summary: "Request a change password email" })
  @ApiOkResponse({
    description: "The forgot password request has been successfully processed",
  })
  @ApiForbiddenResponse({
    description: "The user with the given email was disabled or not verified",
    type: ExceptionDto,
  })
  @ApiNotFoundResponse({
    description: "The user with the given email was not found",
    type: ExceptionDto,
  })
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<void> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  /**
   * Change a users password
   * @param changePasswordDto the change password information
   */
  @Post("change-password")
  @ApiOperation({ summary: "Change a users password" })
  @ApiOkResponse({
    description: "The users password has been successfully changed",
  })
  @ApiBadRequestResponse({
    description:
      "The change password token was expired or the provided change password information was not valid",
    type: ExceptionDto,
  })
  @ApiNotFoundResponse({
    description: "The change password token with the given id was not found",
    type: ExceptionDto,
  })
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    return this.authService.changePassword(changePasswordDto);
  }

  /**
   * Verify a users account
   * @param verifyAccountDto the verify account information
   */
  @Post("verify-account")
  @ApiOperation({ summary: "Verify a users account" })
  @ApiOkResponse({
    description: "The users account has been successfully verified",
  })
  @ApiBadRequestResponse({
    description:
      "The account verification token was expired or the provided account verification information was not valid",
    type: ExceptionDto,
  })
  @ApiNotFoundResponse({
    description:
      "The account verification token with the given id was not found",
    type: ExceptionDto,
  })
  @ApiBody({ type: VerifyAccountDto })
  async verifyAccount(
    @Body() verifyAccountDto: VerifyAccountDto,
  ): Promise<void> {
    return this.authService.verifyAccount(verifyAccountDto);
  }
}
