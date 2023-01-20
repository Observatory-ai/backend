import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuditActionDto } from '../audit/enums/audit-action.enum';
import { AuditResourceDto } from '../audit/enums/audit-resource.enum';
import { Audit } from '../decorators/audit.decorator';
import { ReqUser } from '../decorators/user.decorator';
import { CreateUserDto } from '../user/dtos/create-user.dto';
import { AuthMethod } from '../user/enums/auth-method.enum';
import { Locale } from '../user/enums/locale.enum';
import { User } from '../user/user.entity';
import { ExecutionContext } from '../utils/requests.interface';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { SignUpDto } from './dtos/sign-up.dto';
import { VerifyAccountDto } from './dtos/verify-account.dto';
import { JwtAuthenticationGuard } from './guards/jwt-authentication.guard';
import JwtRefreshGuard from './guards/jwt-refresh-authentication.guard';
import { LocalAuthenticationGuard } from './guards/local-authentication.guard';
import { UserResponseDto } from './models/user-response.model';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  /**
   * Create a new account
   * @param signUpDto the user to create
   */
  @Mutation(() => UserResponseDto)
  register(
    @Context() context: ExecutionContext,
    @Args('SignUpInput') signUpDto: SignUpDto,
  ): Promise<UserResponseDto> {
    // use plainToInstance
    const { email, username, firstName, lastName, password } = signUpDto;
    const createUserDto: CreateUserDto = {
      email,
      username,
      firstName,
      lastName,
      avatar: null,
      password,
      uuid: null,
      googleId: null,
      isVerified: false,
      authMethod: AuthMethod.Local,
      locale: Locale.en_CA, // change to acceptLanguage
    };
    return this.authService.register(context.req, createUserDto);
  }

  /**
   * Log in
   * @param request the request
   * @param user the user (user is injected by the LocalAuthenticationGuard (local strategy))
   */
  @Mutation(() => UserResponseDto)
  @UseGuards(LocalAuthenticationGuard)
  @Audit(AuditActionDto.LogIn, AuditResourceDto.User)
  login(
    @Context() request: ExecutionContext,
    @ReqUser() user: User,
    @Args('SignInInput') _signInDto: SignInDto,
  ): Promise<UserResponseDto> {
    return this.authService.logIn(user, request.req);
  }

  /**
   * Sign out
   * @param request the request
   * @param user the user
   */
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthenticationGuard)
  @Audit(AuditActionDto.LogOut, AuditResourceDto.User)
  async logout(
    @Context() request: ExecutionContext,
    @ReqUser() user: User,
  ): Promise<boolean> {
    return this.authService.logOut(request.req, user);
  }

  /**
   * Refresh a users access and refresh tokens
   * @param request the request
   * @param user the user
   */
  @Mutation(() => UserResponseDto)
  @UseGuards(JwtRefreshGuard)
  async refreshTokens(
    @Context() request: ExecutionContext,
    @ReqUser() user: User,
  ): Promise<UserResponseDto> {
    return this.authService.refreshToken(user, request.req);
  }

  /**
   * Request a change password email
   * @param forgotPasswordDto the forgot password information
   */
  @Mutation(() => Boolean)
  async forgotPassword(
    @Args('ForgotPasswordInput') forgotPasswordDto: ForgotPasswordDto,
  ): Promise<boolean> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  /**
   * Change a users password
   * @param changePasswordDto the change password information
   */
  @Mutation(() => Boolean)
  async changePassword(
    @Args('ChangePasswordInput') changePasswordDto: ChangePasswordDto,
  ): Promise<boolean> {
    return this.authService.changePassword(changePasswordDto);
  }

  /**
   * Verify a users account
   * @param verifyAccountDto the verify account information
   */
  @Mutation(() => Boolean)
  async verifyAccount(
    @Args('VerifyAccountInput') verifyAccountDto: VerifyAccountDto,
  ): Promise<boolean> {
    return this.authService.verifyAccount(verifyAccountDto);
  }
}
