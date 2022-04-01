import { Injectable, UnauthorizedException } from '@nestjs/common';
import { GoogleUserDto } from './dtos/google-user.dto';
import { Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { UserResponseDto } from '../auth/dtos/responses/user-response.dto';
import { AuthMethod } from '../user/enum/auth-method.enum';
import { Locale } from '../user/enum/locale.enum';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { Config, GoogleConfig } from '../config/configuration.interface';
import { Auth, google } from 'googleapis';

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
    googleUser: GoogleUserDto,
    response: Response,
  ): Promise<UserResponseDto> {
    if (!googleUser) {
      throw new UnauthorizedException();
    }
    const user = await this.userService.getByEmail(
      googleUser.profile._json.email,
    );
    if (user) {
      if (user.authMethod == AuthMethod.Local) {
        // update missing field provided by google (firstName, lastName, avatar(if not set), authMethod, locale, googleId)
      }
      return await this.authService.logIn(user, response);
    } else {
      //   await this.setGoogleClientAccessToken(googleUser.accessToken);
      const locale = googleUser.profile._json.locale.replace(/-/g, '_');
      let createUserDto: CreateUserDto = {
        email: googleUser.profile._json.email,
        username: googleUser.profile.displayName,
        firstName: googleUser.profile._json.given_name,
        lastName: googleUser.profile._json.family_name,
        avatar: googleUser.profile._json.picture,
        password: null,
        uuid: null,
        googleId: googleUser.profile.id,
        isVerified: googleUser.profile._json.email_verified,
        authMethod: AuthMethod[googleUser.profile.provider],
        locale: Locale[locale],
      };
      return await this.authService.register(createUserDto);
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
