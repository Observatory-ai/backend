import { Field, Int, ObjectType } from '@nestjs/graphql';
import { GoogleCalendarEventsItemsAttendees } from './google-calendar-events-items-attendees.model';
import { GoogleCalendarEventsItemsCreator } from './google-calendar-events-items-creator.model';
import { GoogleCalendarEventsItemsEnd } from './google-calendar-events-items-end.model';
import { GoogleCalendarEventsItemsOrganizer } from './google-calendar-events-items-organizer.model';
import { GoogleCalendarEventsItemsReminders } from './google-calendar-events-items-reminders.model';
import { GoogleCalendarEventsItemsStart } from './google-calendar-events-items-start.model';

@ObjectType()
export class GoogleCalendarEventsItems {
  @Field()
  kind: string;

  @Field()
  etag: string;

  @Field()
  id: string;

  @Field()
  status: string;

  @Field()
  htmlLink: string;

  @Field()
  created: string;

  @Field()
  updated: string;

  @Field()
  summary: string;

  @Field()
  iCalUID: string;

  @Field(() => Int)
  sequence: number;

  @Field()
  eventType: string;

  @Field(() => GoogleCalendarEventsItemsReminders)
  reminders: GoogleCalendarEventsItemsReminders;

  @Field(() => GoogleCalendarEventsItemsEnd)
  end: GoogleCalendarEventsItemsEnd;

  @Field(() => GoogleCalendarEventsItemsStart)
  start: GoogleCalendarEventsItemsStart;

  @Field(() => GoogleCalendarEventsItemsOrganizer, { nullable: true })
  organizer: GoogleCalendarEventsItemsOrganizer;

  @Field(() => GoogleCalendarEventsItemsCreator, { nullable: true })
  creator: GoogleCalendarEventsItemsCreator;

  @Field(() => [GoogleCalendarEventsItemsAttendees], { nullable: true })
  attendees: [GoogleCalendarEventsItemsAttendees];
}
