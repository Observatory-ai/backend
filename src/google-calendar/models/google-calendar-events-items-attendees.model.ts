import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GoogleCalendarEventsItemsAttendees {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  displayName: string;

  @Field({ nullable: true })
  organizer: boolean;

  @Field({ nullable: true })
  self: boolean;

  @Field({ nullable: true })
  resource: boolean;

  @Field({ nullable: true })
  optional: boolean;

  @Field({ nullable: true })
  responseStatus: string;

  @Field({ nullable: true })
  comment: string;

  @Field(() => Int, { nullable: true })
  additionalGuests: number;
}
