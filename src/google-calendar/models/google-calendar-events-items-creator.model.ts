import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GoogleCalendarEventsItemsCreator {
  @Field()
  email: string;

  @Field()
  displayName: string;

  @Field()
  self: boolean;
}
