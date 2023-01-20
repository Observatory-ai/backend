import { Module } from '@nestjs/common';
import { ServiceIntegrationModule } from '../service-integration/service-integration.module';
import { GoogleCalendarResolver } from './google-calendar.resolver';
import { GoogleCalendarService } from './google-calendar.service';

@Module({
  imports: [ServiceIntegrationModule],
  providers: [GoogleCalendarService, GoogleCalendarResolver],
})
export class GoogleCalendarModule {}
