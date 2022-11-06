import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { UserResponseDto } from '../auth/dtos/responses/user-response.dto';
import { JwtAuthenticationGuard } from '../auth/guards/jwt-authentication.guard';
import { ReqUser } from '../decorators/user.decorator';
import { User } from '../user/user.entity';
import { GoogleCalendarActivationDto } from './dtos/google-calendar-activation.dto';
import { GoogleCalendarEventsDto } from './dtos/google-calendar-events.dto';
import { GoogleCalendarService } from './google-calendar.service';

@Controller('api/google-calendar')
@ApiTags('Google Calendar')
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  @Post('activate')
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
  getCalendarEvents(
    @Body() googleCalendarEventsDto: GoogleCalendarEventsDto,
    @ReqUser() user: any,
  ): Promise<any> {
    console.log('vewbvuywevbue', googleCalendarEventsDto);
    return this.googleCalendarService.getCalendarEvents(
      user,
      googleCalendarEventsDto,
    );
  }
}
