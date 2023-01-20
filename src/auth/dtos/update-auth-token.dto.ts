import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class UpdateAuthTokenDto {
  @Field()
  @IsString()
  refreshToken: string;

  @Field()
  @IsString()
  userAgent: string;
}
