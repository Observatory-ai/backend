import { TokenPayload } from './interfaces/token-payload.interface';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import {
  CookieConfig,
  AuthTokenType,
  COOKIE_CONFIG,
} from './configs/cookie.config';
import { CookieOptions, Request, Response } from 'express';
import { DateUtil } from '../utils/date.util';
import { Token } from '../token/token.entity';
import { TokenType } from '../token/enum/token-type.enum';
import { User } from '../user/user.entity';
import { MailService } from '../mail/mail.service';
import { UserTokenDto } from '../mail/dto/user-token.dto';
import { PasswordChangedDto } from '../mail/dto/password-changed.dto';
import { TokenService } from '../token/token.service';
import { CreateTokenDto } from '../token/dto/create-token.dto';
import { v4 } from 'uuid';
import { UserService } from '../user/user.service';
import { SignUpDto } from './dtos/sign-up.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { RequestWithUser } from '../utils/requests.interface';
import { Config, JwtConfig } from '../config/configuration.interface';
import { InvalidCredentialsException } from '../exception/invalid-credentials.exception';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { VerifyAccountDto } from './dtos/verify-account.dto';
import { UserResponseDto } from './dtos/responses/user-response.dto';
import { plainToClass } from 'class-transformer';
import { SamePasswordException } from '../exception/same-password.exception';

@Injectable()
export class AuthService {
  private readonly jwtConfig: JwtConfig;
  private readonly domain: string;
  private readonly accessCookieConfig: CookieConfig =
    COOKIE_CONFIG[AuthTokenType.Access];
  private readonly refreshCookieConfig: CookieConfig =
    COOKIE_CONFIG[AuthTokenType.Refresh];

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Config>,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
  ) {
    this.jwtConfig = this.configService.get<JwtConfig>('jwt');
    this.domain = this.configService.get<string>('domain');
  }

  /**
   * Creates a user
   * @param signUpDto the user to create
   * @param response the server response instance
   * @returns the user
   */
  async register(signUpDto: SignUpDto): Promise<UserResponseDto> {
    const { email, username, password, birthday } = signUpDto;
    const uuid = v4();
    const createUser: CreateUserDto = {
      email,
      username,
      password,
      birthday,
      uuid,
      isVerified: false,
    };
    const user = await this.userService.create(createUser);
    const userResponseDto = plainToClass(UserResponseDto, user);
    return userResponseDto;
  }

  /**
   * Authenticates a user by generating and setting the jwt access
   * and refresh tokens via cookies
   * @param user the user to log in
   * @param response the server response instance
   * @returns the user
   */
  async logIn(user: User, response: Response): Promise<UserResponseDto> {
    await this.generateAndSetCookie(user, response, AuthTokenType.Access);
    await this.generateAndSetCookie(user, response, AuthTokenType.Refresh);
    const userResponseDto = plainToClass(UserResponseDto, user);
    return userResponseDto;
  }

  /**
   * Generates and sets a jwt access or refresh token via cookies
   * @param user the user
   * @param response the server response instance
   * @param authTokenType the authentication token type
   * @returns the generated jwt token
   */
  async generateAndSetCookie(
    user: User,
    response: Response,
    authTokenType: AuthTokenType,
  ): Promise<string> {
    const generatedToken: string = await this.generateToken(
      user.email,
      authTokenType,
    );
    let cookieKey: string;
    let cookieOptions: CookieOptions;
    let maxAge: number;
    if (authTokenType === AuthTokenType.Access) {
      cookieKey = this.accessCookieConfig.name;
      cookieOptions = this.accessCookieConfig.cookieOptions;
      maxAge = this.accessCookieConfig.expirationTime * 1000;
    } else if (authTokenType === AuthTokenType.Refresh) {
      cookieKey = this.refreshCookieConfig.name;
      cookieOptions = this.refreshCookieConfig.cookieOptions;
      maxAge = this.refreshCookieConfig.expirationTime * 1000;
    }
    response.cookie(cookieKey, generatedToken, {
      ...cookieOptions,
      maxAge,
      domain: this.domain,
    });
    return generatedToken;
  }

  /**
   * Logs a user out by clearing the jwt access and refresh cookies
   * @param response the server response instance
   * @param user the user
   */
  async logOut(response: Response, user?: User): Promise<void> {
    if (user) {
      await this.clearRefreshToken(user.email);
    }
    response.clearCookie(this.accessCookieConfig.name, {
      ...this.accessCookieConfig.cookieOptions,
      maxAge: this.accessCookieConfig.expirationTime * 1000,
      domain: this.domain,
    });
    response.clearCookie(this.refreshCookieConfig.name, {
      ...this.refreshCookieConfig.cookieOptions,
      maxAge: this.refreshCookieConfig.expirationTime * 1000,
      domain: this.domain,
    });
  }

  /**
   * Generates a new jwt refresh token and updates the users refresh cookie
   * @param user the user
   * @param response the server response instance
   */
  async refreshToken(user: User, response: Response): Promise<void> {
    await this.generateAndSetCookie(user, response, AuthTokenType.Refresh);
  }

  /**
   * Trigger the forgot password flow to change a users password
   * @param forgotPasswordDto forgot password details
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const user: User = await this.userService.findByEmail(
      forgotPasswordDto.email,
    );

    const uuid = v4();
    const token: CreateTokenDto = {
      uuid,
      userId: user.id,
      type: TokenType.ChangePassword,
      expiresAt: DateUtil.addDays(new Date()),
    };
    const forgotPasswordToken: Token = await this.tokenService.create(token);
    const userToken: UserTokenDto = {
      user: user,
      token: forgotPasswordToken.uuid,
    };
    this.mailService.handleForgotPassword(userToken);
  }

  /**
   * Change a users password
   * @param changePasswordDto password change details
   */
  async changePassword(changePasswordDto: ChangePasswordDto): Promise<void> {
    const token: Token = await this.tokenService.findOneByUuid(
      changePasswordDto.token,
    );
    const user: User = await this.userService.findOneById(token.userId);
    if (await this.passwordsMatch(changePasswordDto.password, user.password)) {
      throw new SamePasswordException();
    }
    const isTokenDeleted: boolean = await this.tokenService.removeOneByUuid(
      changePasswordDto.token,
    );
    if (!isTokenDeleted) {
      throw new InternalServerErrorException();
    }
    this.tokenService.isTokenExpired(token);
    await this.userService.updatePassword(
      token.userId,
      changePasswordDto.password,
    );
    const passwordChanged: PasswordChangedDto = {
      user,
    };
    this.mailService.handlePasswordChanged(passwordChanged);
  }

  /**
   * Verify a users account
   * @param verifyAccountDto account verification details
   */
  async verifyAccount(verifyAccountDto: VerifyAccountDto): Promise<void> {
    const token: Token = await this.tokenService.findOneByUuid(
      verifyAccountDto.token,
    );
    const isTokenDeleted: boolean = await this.tokenService.removeOneByUuid(
      token.uuid,
    );
    if (!isTokenDeleted) {
      throw new InternalServerErrorException();
    }
    this.tokenService.isTokenExpired(token);
    await this.userService.verify(token.userId);
  }

  /**
   * Used by the Passport strategy to verify the supplied user credentials
   * @param email the users email
   * @param password the users password
   * @returns the user with the matching email and password
   */
  async validate(emailOrUsername: string, password: string): Promise<User> {
    const user: User = await this.userService.findByEmailOrUsername(
      emailOrUsername,
    );
    const passwordsMatch = await this.passwordsMatch(password, user.password);
    if (!passwordsMatch) throw new InvalidCredentialsException();
    return user;
  }

  /**
   * Validates a jwt access or refresh token from a cookie
   * @param token the token to validate
   * @param authTokenType the type of authentication token
   * @returns the decoded access or refresh token
   */
  validateCookieToken(
    token: string,
    authTokenType: AuthTokenType,
  ): TokenPayload {
    let secret: string;
    if (authTokenType === AuthTokenType.Access) {
      secret = this.jwtConfig.access.secret;
    } else if (authTokenType === AuthTokenType.Refresh) {
      secret = this.jwtConfig.refresh.secret;
    }
    return this.jwtService.verify<TokenPayload>(token, {
      secret,
    });
  }

  /**
   * Extracts a jwt access or refresh token from the cookies present
   * in the given request
   * @param request the server request instance
   * @param authTokenType the authentication token type
   * @returns the jwt token present in the cookie
   */
  static getTokenFromRequest(
    request: Request,
    authTokenType: AuthTokenType,
  ): string {
    return request.cookies[COOKIE_CONFIG[authTokenType].name];
  }

  /**
   * Checks whether the user is authenticated or not
   * @param request the server request instance
   * @param response the server response instance
   * @throws UnauthorizedException
   */
  async canActivate(
    request: Request | RequestWithUser,
    response: Response,
  ): Promise<void> {
    try {
      // Check the access token
      let accessToken: string = AuthService.getTokenFromRequest(
        request,
        AuthTokenType.Access,
      );
      if (!accessToken) throw new UnauthorizedException();
      try {
        accessToken = accessToken || '';
        const decodedAccessToken: TokenPayload = this.validateCookieToken(
          accessToken,
          AuthTokenType.Access,
        );
        if (!decodedAccessToken) throw new UnauthorizedException();
        const user: User = await this.userService.findByEmail(
          decodedAccessToken.email,
        );
        request.user = user;
        return;
      } catch (err) {
        // Catch TokenExpiredError, do nothing if this is not being used by the websocket proxy
      }

      // Check the refresh token
      const refreshToken: string = AuthService.getTokenFromRequest(
        request,
        AuthTokenType.Refresh,
      );
      if (!refreshToken) throw new UnauthorizedException();
      const decodedRefreshToken: TokenPayload = this.validateCookieToken(
        refreshToken,
        AuthTokenType.Refresh,
      );
      if (!decodedRefreshToken) throw new UnauthorizedException();

      // Check if the user has the refresh token
      const user: User = await this.userService.findByEmailAndRefreshToken(
        decodedRefreshToken.email,
        refreshToken,
      );

      // Generate and set the new access token (in the response)
      const newAccessToken: string = await this.generateAndSetCookie(
        user,
        response,
        AuthTokenType.Access,
      );
      // Set the new access token in the current request
      request.cookies[this.accessCookieConfig.name] = newAccessToken;
    } catch (err) {
      // Something went wrong, clear the users access and refresh tokens
      await this.logOut(response);
      throw new UnauthorizedException();
    }
  }

  /**
   * Generates a jwt access or refresh token
   * @param email the users email
   * @param authTokenType the authentication token type
   * @returns the generated access or refresh token
   */
  private async generateToken(
    email: string,
    authTokenType: AuthTokenType,
  ): Promise<string> {
    let secret: string;
    let expiresIn: number;
    if (authTokenType === AuthTokenType.Access) {
      secret = this.jwtConfig.access.secret;
      expiresIn = this.accessCookieConfig.expirationTime;
    } else if (authTokenType === AuthTokenType.Refresh) {
      secret = this.jwtConfig.refresh.secret;
      expiresIn = this.refreshCookieConfig.expirationTime;
    }
    const generatedToken: string = this.jwtService.sign(
      { email },
      {
        secret,
        expiresIn: `${expiresIn}s`,
      },
    );
    if (authTokenType === AuthTokenType.Refresh) {
      await this.userService.updateRefreshToken(email, generatedToken);
    }
    return generatedToken;
  }

  /**
   * Checks if the plain text password and hashed passwords match
   * @param password the plain text password
   * @param hashedPassword the hashed password
   * @throws InvalidCredentialsException
   */
  private async passwordsMatch(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const passwordsMatch: boolean = await bcrypt.compare(
      password,
      hashedPassword,
    );
    return passwordsMatch;
  }

  /**
   * Clears the users refresh token from the database
   * @param email the users email
   */
  private async clearRefreshToken(email: string): Promise<void> {
    await this.userService.clearRefreshToken(email);
  }
}
