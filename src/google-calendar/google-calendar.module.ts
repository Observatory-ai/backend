import { Module } from '@nestjs/common';
import { ServiceIntegrationModule } from '../service-integration/service-integration.module';
import { GoogleCalendarController } from './google-calendar.controller';
import { GoogleCalendarService } from './google-calendar.service';

@Module({
  imports: [ServiceIntegrationModule],
  controllers: [GoogleCalendarController],
  providers: [GoogleCalendarService],
})
export class GoogleCalendarModule {}
