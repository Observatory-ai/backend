import { Field, InputType } from '@nestjs/graphql';
import { IsNumber, IsString } from 'class-validator';

@InputType()
export class CreateAuthTokenDto {
  @Field()
  @IsNumber()
  userId: number;

  @Field()
  @IsString()
  refreshToken: string;

  @Field()
  @IsString()
  userAgent: string;
}
