import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { Auth, google } from 'googleapis';
import { UserResponseDto } from '../auth/dtos/responses/user-response.dto';
import { Config, GoogleConfig } from '../config/configuration.interface';
import { CreateServiceDto } from '../service-integration/dtos/create-service.dto';
import { Api } from '../service-integration/enum/api.enum';
import { ServiceType } from '../service-integration/enum/service-type.enum';
import { ServiceIntegrationService } from '../service-integration/service-integration.service';
import { User } from '../user/user.entity';
import { GoogleCalendarActivationDto } from './dtos/google-calendar-activation.dto';
const url = require('url');

@Injectable()
export class GoogleCalendarService {
  oauthClient: Auth.OAuth2Client;
  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly serviceIntegrationService: ServiceIntegrationService,
  ) {
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
  async activateService(
    googleCalendarActivationDto: GoogleCalendarActivationDto,
    user: User,
  ): Promise<UserResponseDto> {
    // let query = url.parse(request.url, true).query;
    // if (query.error) throw new UnauthorizedException();

    let { tokens } = await this.oauthClient.getToken(
      googleCalendarActivationDto.accessToken,
    );
    this.setGoogleClientTokens(tokens.refresh_token, tokens.access_token);

    if (
      await this.serviceIntegrationService.doesExists(
        ServiceType.google,
        user.id,
      )
    ) {
      if (!!tokens.refresh_token) {
        let { apis } = await this.serviceIntegrationService.getService(
          ServiceType.google,
          user.id,
        );
        if (apis.includes(Api.Google_Calendar)) {
          await this.serviceIntegrationService.updateRefreshToken(
            ServiceType.google,
            user.id,
            tokens.refresh_token,
          );
        } else {
          apis.push(Api.Google_Calendar);
          await this.serviceIntegrationService.updateRefreshTokenAndApis(
            ServiceType.google,
            user.id,
            tokens.refresh_token,
            apis,
          );
        }
      }
    } else {
      const service: CreateServiceDto = {
        service: ServiceType.google,
        refreshToken: tokens.refresh_token,
        userId: user.id,
        apis: [Api.Google_Calendar],
        isActive: true,
      };

      this.serviceIntegrationService.create(service);
    }
    const userResponseDto = plainToClass(UserResponseDto, user);
    return userResponseDto;
  }

  async getCalendarEvents(user: User): Promise<any> {
    const { refreshToken } = await this.serviceIntegrationService.getService(
      user.id,
      ServiceType.google,
    );
    this.oauthClient.setCredentials({
      refresh_token: refreshToken,
    });
    const events = await this.getUserCalendarEvents();
    return events;
  }

  /**
   * Set access token for google client
   * @param accessToken the user's access token
   */
  async setGoogleClientTokens(
    refreshToken: string,
    accessToken?: string,
  ): Promise<void> {
    await this.oauthClient.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  /**
   * Get the user google calendar events on main calendar
   * @param accessToken the user's access token
   */
  async getUserCalendarEvents(): Promise<any> {
    const service = google.calendar({ version: 'v3', auth: this.oauthClient });
    const res = await service.events.list({
      calendarId: 'primary',
    });
    return res.data;
  }
}
