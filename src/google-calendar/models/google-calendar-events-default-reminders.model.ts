import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GoogleCalendarEventsDefaultReminders {
  @Field()
  method: string;

  @Field(() => Int)
  minutes: number;
}
