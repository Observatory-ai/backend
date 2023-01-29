import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { Auth, google } from 'googleapis';
import { Config, GoogleConfig } from '../config/configuration.interface';
import { CreateServiceDto } from '../service-integration/dtos/create-service.dto';
import { Api } from '../service-integration/enum/api.enum';
import { ServiceType } from '../service-integration/enum/service-type.enum';
import { ServiceIntegrationService } from '../service-integration/service-integration.service';
import { User } from '../user/user.entity';
import { CacheUtil } from '../utils/cache.util';
import { GoogleCalendarActivationDto } from './dtos/google-calendar-activation.dto';
import { GoogleCalendarEvents } from './models/google-calendar-events.model';

@Injectable()
export class GoogleCalendarService {
  oauthClient: Auth.OAuth2Client;
  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly serviceIntegrationService: ServiceIntegrationService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {
    const clientID =
      this.configService.get<GoogleConfig>('google').authClientId;
    const clientSecret =
      this.configService.get<GoogleConfig>('google').authClientSecret;

    this.oauthClient = new google.auth.OAuth2(
      clientID,
      clientSecret,
      'postmessage',
    );
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
  ): Promise<boolean> {
    const { tokens } = await this.oauthClient.getToken(
      googleCalendarActivationDto.activationCode,
    );
    this.setGoogleClientTokens(tokens.refresh_token, tokens.access_token);
    if (
      await this.serviceIntegrationService.doesExists(
        ServiceType.google,
        user.id,
      )
    ) {
      if (tokens.refresh_token) {
        const { apis } = await this.serviceIntegrationService.getService(
          user.id,
          ServiceType.google,
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
    return true;
  }

  async getCalendarEvents(user: User): Promise<GoogleCalendarEvents | null> {
    const service = await this.serviceIntegrationService.getService(
      user.id,
      ServiceType.google,
    );
    if (service?.refreshToken) {
      this.oauthClient.setCredentials({
        refresh_token: service?.refreshToken,
      });

      const cacheKey = CacheUtil.createCacheKey(
        user.uuid,
        ServiceType.google.toString(),
        Api.Google_Calendar.toString(),
      );

      const events = await CacheUtil.withCache<GoogleCalendarEvents | null>(
        cacheKey,
        this.cacheManager,
        this.getWeeklyTrends.bind(this),
        60 * 60,
      );

      // const events = await this.getWeeklyTrends();

      return events;
    }
    return null;

    /* model:
     * insights array
     * data array (X axis and Y axis)
     * data series
     */
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

  // Make output format with Hasura
  // can't be used as of now
  // async getFreeBusy(): Promise<any> {
  //   const today = new Date();
  //   const startOfTheWeek = new Date(
  //     new Date().setDate(today.getDate() - today.getDay()),
  //   );
  //   const endOfTheWeek = new Date(
  //     today.setDate(today.getDate() - today.getDay() + 6),
  //   );
  //   const service = google.calendar({ version: 'v3', auth: this.oauthClient });
  //   const res = await service.freebusy.query({
  //     requestBody: {
  //       timeMin: startOfTheWeek.toISOString(),
  //       timeMax: endOfTheWeek.toISOString(),
  //       items: [{ id: 'primary' }],
  //     },
  //   });
  //   return res.data;
  // }

  async getWeeklyTrends(): Promise<any> {
    const today = new Date();
    const startOfTheWeek = new Date(new Date().setDate(today.getDate() - 30));
    const endOfTheWeek = new Date(
      today.setDate(today.getDate() - today.getDay() + 6),
    );
    const service = google.calendar({ version: 'v3', auth: this.oauthClient });
    const res = await service.events.list({
      calendarId: 'primary',
      timeMin: startOfTheWeek.toISOString(),
      timeMax: endOfTheWeek.toISOString(),
      orderBy: 'startTime',
      singleEvents: true,
    });
    return res.data;
  }

  /**
   * Get the user google calendar events on main calendar
   * @param accessToken the user's access token
   */
  async getUserCalendarEvents(): Promise<any> {
    const startOfTheWeek = new Date();
    startOfTheWeek.setDate(startOfTheWeek.getDate() - startOfTheWeek.getDay());
    const endOfTheWeek = new Date();
    endOfTheWeek.setDate(endOfTheWeek.getDate() - endOfTheWeek.getDay() + 7);

    const service = google.calendar({ version: 'v3', auth: this.oauthClient });
    const res = await service.events.list({
      calendarId: 'primary',
      timeMin: startOfTheWeek.toISOString(),
      timeMax: endOfTheWeek.toISOString(),
      orderBy: 'startTime',
      singleEvents: true,
    });
    return res.data;
  }
}
