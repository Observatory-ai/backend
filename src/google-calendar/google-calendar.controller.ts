import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GoogleCalendarService } from './google-calendar.service';
import { Request as ExpressRequest } from 'express';
import { ReqUser } from '../decorators/user.decorator';
import { User } from '../user/user.entity';
import { UserResponseDto } from '../auth/dtos/responses/user-response.dto';
import { JwtAuthenticationGuard } from '../auth/guards/jwt-authentication.guard';

@Controller('api/google-calendar')
@ApiTags('Google Calendar')
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  @Get('activate')
  @UseGuards(JwtAuthenticationGuard)
  async googleCalendar(
    @Request() request: ExpressRequest,
    @ReqUser() user: User,
  ): Promise<void> {
    return this.googleCalendarService.requestService(user, request);
  }

  @Get('activate/callback')
  @UseGuards(JwtAuthenticationGuard)
  googleCalendarRedirect(
    @Request() request: ExpressRequest,
    @ReqUser() user: User,
  ): Promise<UserResponseDto> {
    return this.googleCalendarService.activateService(request, user);
  }

  @Get('events')
  @UseGuards(JwtAuthenticationGuard)
  getCalendarEvents(@ReqUser() user: any): Promise<any> {
    return this.googleCalendarService.getCalendarEvents(user);
  }
}
