import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthenticationGuard } from '../auth/guards/jwt-authentication.guard';
import { ReqUser } from '../decorators/user.decorator';
import { User } from '../user/user.entity';
import { GoogleCalendarActivationDto } from './dtos/google-calendar-activation.dto';
import { GoogleCalendarService } from './google-calendar.service';
import { GoogleCalendarEvents } from './models/google-calendar-events.model';

@Resolver(() => GoogleCalendarEvents)
export class GoogleCalendarResolver {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthenticationGuard)
  async activateGoogleCalendar(
    @Args('GoogleCalendarActivationInput')
    googleCalendarActivationDto: GoogleCalendarActivationDto,
    @ReqUser() user: User,
  ): Promise<boolean> {
    return await this.googleCalendarService.activateService(
      googleCalendarActivationDto,
      user,
    );
  }

  @Query(() => GoogleCalendarEvents || null, { nullable: true })
  @UseGuards(JwtAuthenticationGuard)
  async googleCalendarEvents(
    @ReqUser() user: any,
  ): Promise<GoogleCalendarEvents | null> {
    return await this.googleCalendarService.getCalendarEvents(user);
  }
}
