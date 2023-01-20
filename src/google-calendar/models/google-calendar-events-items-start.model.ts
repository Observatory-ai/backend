import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GoogleCalendarEventsItemsStart {
  @Field()
  dateTime: string;

  @Field()
  timeZone: string;
}
