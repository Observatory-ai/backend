import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GoogleCalendarEventsItemsEnd {
  @Field()
  dateTime: string;

  @Field()
  timeZone: string;
}
