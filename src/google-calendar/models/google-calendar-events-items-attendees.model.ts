import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GoogleCalendarEventsItemsAttendees {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  displayName: string;

  @Field()
  organizer: boolean;

  @Field()
  self: boolean;

  @Field()
  resource: boolean;

  @Field()
  optional: boolean;

  @Field()
  responseStatus: string;

  @Field()
  comment: string;

  @Field(() => Int)
  additionalGuests: number;
}
