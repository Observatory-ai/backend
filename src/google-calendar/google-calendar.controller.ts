import { Body, Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { UserResponseDto } from '../auth/dtos/responses/user-response.dto';
import { JwtAuthenticationGuard } from '../auth/guards/jwt-authentication.guard';
import { ReqUser } from '../decorators/user.decorator';
import { User } from '../user/user.entity';
import { GoogleCalendarActivationDto } from './dtos/google-calendar-activation.dto';
import { GoogleCalendarService } from './google-calendar.service';

@Controller('api/google-calendar')
@ApiTags('Google Calendar')
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  // @Get('activate')
  // @UseGuards(JwtAuthenticationGuard)
  // async googleCalendar(
  //   @Request() request: ExpressRequest,
  //   @ReqUser() user: User,
  // ): Promise<void> {
  //   return this.googleCalendarService.requestService(user, request);
  // }

  @Get('activate')
  @UseGuards(JwtAuthenticationGuard)
  googleCalendarActivate(
    @Body() googleCalendarActivationDto: GoogleCalendarActivationDto,
    @ReqUser() user: User,
  ): Promise<UserResponseDto> {
    return this.googleCalendarService.activateService(
      googleCalendarActivationDto,
      user,
    );
  }

  @Get('events')
  @UseGuards(JwtAuthenticationGuard)
  @ApiCookieAuth()
  getCalendarEvents(@ReqUser() user: any): Promise<any> {
    return this.googleCalendarService.getCalendarEvents(user);
  }
}
