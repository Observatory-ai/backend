import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GoogleCalendarEventsItemsOrganizer {
  @Field()
  email: string;

  @Field()
  displayName: string;

  @Field()
  self: boolean;
}
