import { Field, ObjectType } from '@nestjs/graphql';
import { GoogleCalendarEventsDefaultReminders } from './google-calendar-events-default-reminders.model';
import { GoogleCalendarEventsItems } from './google-calendar-events-items.model';

@ObjectType()
export class GoogleCalendarEvents {
  @Field()
  kind: string;

  @Field()
  etag: string;

  @Field()
  summary: string;

  @Field()
  updated: string;

  @Field()
  timeZone: string;

  @Field()
  accessRole: string;

  @Field(() => [GoogleCalendarEventsItems])
  items: [GoogleCalendarEventsItems];

  @Field(() => [GoogleCalendarEventsDefaultReminders])
  defaultReminders: [GoogleCalendarEventsDefaultReminders];
}
