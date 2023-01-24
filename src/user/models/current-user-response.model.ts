import { Field, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@ObjectType()
export class CurrentUserResponseDto {
  @Field()
  @IsString()
  uuid: string;

  @Field()
  @IsString()
  email: string;

  @Field()
  @IsString()
  username: string;

  @Field()
  @IsString()
  avatar: string;
}
