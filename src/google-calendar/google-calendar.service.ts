import { Injectable } from '@nestjs/common';
import { UserResponseDto } from '../auth/dtos/responses/user-response.dto';
import { User } from '../user/user.entity';
import { Request as ExpressRequest } from 'express';
import { Auth, google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import { Config, GoogleConfig } from '../config/configuration.interface';

@Injectable()
export class GoogleCalendarService {
  oauthClient: Auth.OAuth2Client;
  constructor(private readonly configService: ConfigService<Config>) {
    const clientID =
      this.configService.get<GoogleConfig>('google').authClientId;
    const clientSecret =
      this.configService.get<GoogleConfig>('google').authClientSecret;

    this.oauthClient = new google.auth.OAuth2(clientID, clientSecret);
  }

  /**
   * Authenticate with Google
   * @param user the user
   * @param response the server response instance
   * @returns the response object for authentication
   */
  async requestService(user: User, request: ExpressRequest): Promise<void> {
    console.log(user);
    // check if user is authenticated with google
    // if not get user google info
    // check if there is a refresh token
    // if not ask for authorization
    // if there is a refresh token get access token and prepare for requests
    const authorizationUrl = this.oauthClient.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: 'offline',
      login_hint: user.email,
      scope: [
        'email',
        'profile',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/calendar.events.readonly',
      ],
      include_granted_scopes: true,
      redirect_uri:
        'http://localhost:3000/api/google-calendar/activate/callback',
    });
    request.res.redirect(authorizationUrl);
  }

  /**
   * Authenticate with Google
   * @param user the user
   * @param response the server response instance
   * @returns the response object for authentication
   */
  async activateService(
    request: ExpressRequest,
    user: any,
  ): Promise<UserResponseDto | void> {
    console.log(user);
    return;
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
