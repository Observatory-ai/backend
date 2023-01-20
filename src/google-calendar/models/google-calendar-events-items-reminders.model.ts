import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GoogleCalendarEventsItemsReminders {
  @Field()
  useDefault: boolean;
}
