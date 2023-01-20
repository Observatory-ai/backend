import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request as ExpressRequest } from 'express';
import { Auth, google } from 'googleapis';
import { AuthService } from '../auth/auth.service';
import { UserResponseDto } from '../auth/models/user-response.model';
import { Config, GoogleConfig } from '../config/configuration.interface';
import { CreateUserDto } from '../user/dtos/create-user.dto';
import { AuthMethod } from '../user/enums/auth-method.enum';
import { Locale } from '../user/enums/locale.enum';
import { UserService } from '../user/user.service';
import { GoogleAuthDto } from './dtos/google-auth.dto';

@Injectable()
export class GoogleAuthService {
  oauthClient: Auth.OAuth2Client;
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService<Config>,
  ) {
    const clientID =
      this.configService.get<GoogleConfig>('google').authClientId;
    const clientSecret =
      this.configService.get<GoogleConfig>('google').authClientSecret;

    this.oauthClient = new google.auth.OAuth2(clientID, clientSecret);
  }

  /**
   * Authenticate with Google
   * @param googleUser the user from google
   * @param request the server request instance
   * @returns the response object for authentication
   */
  async authenticate(
    googleAuthDto: GoogleAuthDto,
    request: ExpressRequest,
  ): Promise<UserResponseDto> {
    if (!googleAuthDto.accessToken) {
      throw new UnauthorizedException();
    }

    this.setGoogleClientAccessToken(googleAuthDto.accessToken);
    const { data: googleUser } = await google
      .oauth2('v2')
      .userinfo.get({ auth: this.oauthClient });

    const user = await this.userService.getByEmail(googleUser.email);

    if (user) {
      if (user.authMethod == AuthMethod.Local) {
        // update missing field provided by google (firstName, lastName, avatar(if not set), authMethod, locale, googleId)
      }
      return await this.authService.logIn(user, request);
    } else {
      const locale = googleUser.locale.replace(/-/g, '_');
      const createUserDto: CreateUserDto = {
        email: googleUser.email,
        username: googleUser.name,
        firstName: googleUser.given_name,
        lastName: googleUser.family_name,
        avatar: googleUser.picture,
        password: null,
        uuid: null,
        googleId: googleUser.id,
        isVerified: googleUser.verified_email,
        authMethod: AuthMethod.google,
        locale: Locale[locale],
      };
      return await this.authService.register(request, createUserDto);
    }
  }

  /**
   * Set access token for google client
   * @param accessToken the user's access token
   */
  async setGoogleClientAccessToken(accessToken: string): Promise<void> {
    await this.oauthClient.setCredentials({
      access_token: accessToken,
    });
  }
}
