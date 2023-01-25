import { Field, ObjectType } from '@nestjs/graphql';
import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Exclude()
@ObjectType()
export class UserResponseDto {
  @Field()
  @Expose()
  @IsString()
  uuid: string;

  @Field()
  @Expose()
  @IsString()
  email: string;

  @Field()
  @Expose()
  @IsString()
  username: string;

  @Field()
  @Expose()
  @IsString()
  accessToken: string;

  @Field({ nullable: true })
  @Expose()
  @IsString()
  avatar: string;
}
