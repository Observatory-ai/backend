import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { Request as ExpressRequest } from 'express';
import { v4 } from 'uuid';
import { AuditService } from '../audit/audit.service';
import { Config, JwtConfig } from '../config/configuration.interface';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';
import { SamePasswordException } from '../exceptions/same-password.exception';
import { PasswordChangedDto } from '../mail/dtos/password-changed.dto';
import { UserTokenDto } from '../mail/dtos/user-token.dto';
import { MailService } from '../mail/mail.service';
import { CreateTokenDto } from '../token/dtos/create-token.dto';
import { TokenType } from '../token/enums/token-type.enum';
import { Token } from '../token/token.entity';
import { TokenService } from '../token/token.service';
import { CreateUserDto } from '../user/dtos/create-user.dto';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { DateUtil } from '../utils/date.util';
import {
  RequestWithAccessToken,
  RequestWithRefreshToken,
} from '../utils/requests.interface';
import { AuthTokenRepository } from './auth-token.repository';
import {
  AuthTokenType,
  CookieConfig,
  COOKIE_CONFIG,
} from './configs/cookie.config';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { CreateAuthTokenDto } from './dtos/create-auth-token.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { UpdateAuthTokenDto } from './dtos/update-auth-token.dto';
import { VerifyAccountDto } from './dtos/verify-account.dto';
import { TokenPayload } from './interfaces/token-payload.interface';
import { UserResponseDto } from './models/user-response.model';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuditService.name);
  private readonly jwtConfig: JwtConfig;
  private readonly domain: string;
  private readonly accessCookieConfig: CookieConfig =
    COOKIE_CONFIG[AuthTokenType.Access];
  private readonly refreshCookieConfig: CookieConfig =
    COOKIE_CONFIG[AuthTokenType.Refresh];

  constructor(
    @InjectRepository(AuthTokenRepository)
    private readonly authTokenRepository: AuthTokenRepository,
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
   * Extracts a jwt refresh token from the cookies
   * in the given request
   * @param request the server request instance
   * @param authTokenType the authentication token type
   * @returns the jwt token present in the cookie
   */
  static getRefreshTokenFromRequest(request: ExpressRequest): string {
    return request.cookies[COOKIE_CONFIG[AuthTokenType.Refresh].name];
  }

  /**
   * Extracts a jwt access token from the authorization header
   * in the given request
   * @param request the server request instance
   * @param authTokenType the authentication token type
   * @returns the jwt token present in the cookie
   */
  static getAccessTokenFromRequest(request: ExpressRequest): string {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) throw new UnauthorizedException();
    return request.headers.authorization.split(' ')[1];
  }

  /**
   * Creates a user
   * @param createUserDto the user to create
   * @param response the server response instance
   * @returns the user
   */
  async register(
    request: ExpressRequest,
    createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    const uuid = await v4();
    createUserDto.uuid = uuid;
    const user = await this.userService.create(createUserDto);
    return await this.logIn(user, request);
  }

  /**
   * Authenticates a user by generating and setting the jwt access
   * and refresh tokens via cookies
   * @param user the user to log in
   * @param response the server response instance
   * @returns the user
   */
  async logIn(user: User, request: ExpressRequest): Promise<UserResponseDto> {
    const accessToken: string = await this.generateToken(
      user.email,
      AuthTokenType.Access,
    );

    const newRefreshToken: string = await this.generateToken(
      user.email,
      AuthTokenType.Refresh,
    );

    const refreshTokenFromRequest =
      AuthService.getRefreshTokenFromRequest(request);

    const foundToken = await this.authTokenRepository.findAuthToken(
      refreshTokenFromRequest,
      user.id,
    );

    let emptyNewRefreshTokenArray = false;

    if (request.cookies?.jwt) {
      if (!foundToken) {
        emptyNewRefreshTokenArray = true;
      }

      this.clearRefreshTokenCookie(request.res);
    }

    const userAgent = request.get('user-agent');

    if (emptyNewRefreshTokenArray) {
      await this.authTokenRepository.deleteAuthTokensByUserId(user.id);
      const createAuthTokenDto = plainToInstance(CreateAuthTokenDto, {
        userId: user.id,
        refreshToken: newRefreshToken,
        userAgent,
      });

      await this.authTokenRepository.createAuthToken(createAuthTokenDto);
    } else {
      if (foundToken) {
        const updateAuthTokenDto = plainToInstance(UpdateAuthTokenDto, {
          refreshToken: newRefreshToken,
          userAgent,
        });

        await this.authTokenRepository.updateAuthToken(
          foundToken.id,
          updateAuthTokenDto,
        );
      } else {
        const createAuthTokenDto = plainToInstance(CreateAuthTokenDto, {
          userId: user.id,
          refreshToken: newRefreshToken,
          userAgent,
        });

        await this.authTokenRepository.createAuthToken(createAuthTokenDto);
      }
    }

    this.setRefreshTokenCookie(newRefreshToken, request.res);

    const userResponseDto = plainToInstance(UserResponseDto, {
      ...user,
      accessToken,
    });
    return userResponseDto;
  }

  /**
   * Sets a jwt refresh token via a cookie
   * @param refreshToken the refresh token
   * @param response the server response instance
   */
  setRefreshTokenCookie(refreshToken: string, response: ExpressRequest['res']) {
    const { name, cookieOptions, expirationTime } = this.refreshCookieConfig;
    response.cookie(name, refreshToken, {
      ...cookieOptions,
      maxAge: expirationTime * 1000,
      domain: 'localhost', // this.domain,
    });
  }

  /**
   * Clears the jwt refresh token cookie
   * @param response the server response instance
   */
  clearRefreshTokenCookie(response: ExpressRequest['res']) {
    const { name, cookieOptions, expirationTime } = this.refreshCookieConfig;
    response.clearCookie(name, {
      ...cookieOptions,
      maxAge: expirationTime * 1000,
      domain: 'localhost', // this.domain
    });
  }

  /**
   * Logs a user out by clearing the jwt refresh cookie
   * @param response the server response instance
   * @param user the user
   */
  async logOut(request: ExpressRequest, user?: User): Promise<boolean> {
    if (user) {
      const refreshToken = AuthService.getRefreshTokenFromRequest(request);
      await this.authTokenRepository.deleteAuthTokenByRefreshToken(
        refreshToken,
      );
    }

    this.clearRefreshTokenCookie(request.res);
    return true;
  }

  /**
   * Generates a new jwt refresh token and updates the users refresh cookie
   * @param user the user
   * @param response the server response instance
   */
  async refreshToken(
    user: User,
    request: RequestWithRefreshToken,
  ): Promise<UserResponseDto> {
    const newRefreshToken: string = await this.generateToken(
      user.email,
      AuthTokenType.Refresh,
    );

    const newAccessToken: string = await this.generateToken(
      user.email,
      AuthTokenType.Access,
    );

    const userAgent = request.get('user-agent');

    const updateAuthTokenDto = plainToInstance(UpdateAuthTokenDto, {
      refreshToken: newRefreshToken,
      userAgent,
    });

    const authToken = request.refreshToken;
    await this.authTokenRepository.updateAuthToken(
      authToken.id,
      updateAuthTokenDto,
    );

    this.setRefreshTokenCookie(newRefreshToken, request.res);

    const userResponseDto = plainToInstance(UserResponseDto, {
      ...user,
      accessToken: newAccessToken,
    });

    return userResponseDto;
  }

  /**
   * Trigger the forgot password flow to change a users password
   * @param forgotPasswordDto forgot password details
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<boolean> {
    const user: User = await this.userService.findByEmailOrUsername(
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
    return true;
  }

  /**
   * Change a users password
   * @param changePasswordDto password change details
   */
  async changePassword(changePasswordDto: ChangePasswordDto): Promise<boolean> {
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
    return true;
  }

  /**
   * Verify a users account
   * @param verifyAccountDto account verification details
   */
  async verifyAccount(verifyAccountDto: VerifyAccountDto): Promise<boolean> {
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
    return true;
  }

  /**
   * Validates a jwt access or refresh token from a cookie
   * @param token the token to validate
   * @param authTokenType the type of authentication token
   * @returns the decoded access or refresh token
   */
  validateToken(token: string, authTokenType: AuthTokenType): TokenPayload {
    let secret: string;
    if (authTokenType === AuthTokenType.Access) {
      secret = this.jwtConfig.access.secret;
    } else if (authTokenType === AuthTokenType.Refresh) {
      secret = this.jwtConfig.refresh.secret;
    }
    let tokenPayload = null;
    try {
      tokenPayload = this.jwtService.verify<TokenPayload>(token, {
        secret,
      });
    } catch (exception) {}
    return tokenPayload;
  }

  /**
   * Used by the Passport strategy to verify the supplied user credentials
   * @param email the users email
   * @param password the users password
   * @returns the user with the matching email and password
   */
  async validateLocalAuth(
    emailOrUsername: string,
    password: string,
  ): Promise<User> {
    try {
      const user: User = await this.userService.findByEmailOrUsername(
        emailOrUsername,
      );
      if (!user.password) throw new InvalidCredentialsException();
      const passwordsMatch = await this.passwordsMatch(password, user.password);
      if (!passwordsMatch) throw new InvalidCredentialsException();
      return user;
    } catch (exception) {
      throw new InvalidCredentialsException();
    }
  }

  /**
   * Checks whether the user is authenticated or not
   * @param request the server request instance
   * @returns the authenticated user
   * @throws UnauthorizedException
   */
  async validateJWT(
    request: RequestWithAccessToken,
    tokenPayload: TokenPayload,
  ): Promise<User> {
    const refreshTokenFromRequest: string =
      AuthService.getRefreshTokenFromRequest(request);

    if (!refreshTokenFromRequest) throw new UnauthorizedException();

    const decodedRefreshToken: TokenPayload = this.validateToken(
      refreshTokenFromRequest,
      AuthTokenType.Refresh,
    );

    if (!decodedRefreshToken) {
      await this.authTokenRepository.deleteAuthTokenByRefreshToken(
        refreshTokenFromRequest,
      );
      throw new UnauthorizedException();
    }

    const { email } = decodedRefreshToken;
    const user = await this.userService.findByEmailOrUsername(email);

    const foundToken = await this.authTokenRepository.findAuthToken(
      refreshTokenFromRequest,
      user.id,
    );

    if (!foundToken) {
      await this.logOut(request);
      await this.authTokenRepository.deleteAuthTokensByUserId(user.id);
      throw new UnauthorizedException();
    }

    const newAccessToken: string = await this.generateToken(
      tokenPayload.email,
      AuthTokenType.Access,
    );

    request.accessToken = newAccessToken;
    return user;
  }

  /**
   * Checks whether the user is authenticated or not
   * @param request the server request instance
   * @returns the authenticated user
   * @throws UnauthorizedException
   */
  async validateJWTRefresh(
    request: RequestWithRefreshToken,
    tokenPayload: TokenPayload,
  ): Promise<User> {
    const refreshTokenFromRequest =
      AuthService.getRefreshTokenFromRequest(request);

    const user = await this.userService.findByEmailOrUsername(
      tokenPayload.email,
    );

    const foundToken = await this.authTokenRepository.findAuthToken(
      refreshTokenFromRequest,
      user.id,
    );

    if (!foundToken) {
      await this.authTokenRepository.deleteAuthTokensByUserId(user.id);
      this.clearRefreshTokenCookie(request.res);
      throw new UnauthorizedException();
    }

    request.refreshToken = foundToken;
    return user;
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
    // const jwtId = await v4(); -> user RTI
    // get user RTI
    const generatedToken: string = this.jwtService.sign(
      { email },
      {
        secret,
        // jwtid: jwtId,
        expiresIn: `${expiresIn}s`,
      },
    );
    // if (authTokenType === AuthTokenType.Refresh) {
    //  update user RTI
    // }
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

  // create cron job to delete expired refresh tokens from the database
  /**
   * Cron job that runs every hour and deletes audit logs that have been
   * created 28 days ago or greater
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  private async deleteExpiredAuditLogsJob(): Promise<void> {
    this.logger.log('Delete expired auth tokens cron job running');
    const deletedCount =
      await this.authTokenRepository.deleteExpiredAuthTokens();
    this.logger.log(
      `Delete expired auth tokens cron job finished - ${deletedCount} auth tokens deleted`,
    );
  }
}
