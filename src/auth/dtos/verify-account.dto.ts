import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class VerifyAccountDto {
  @Field()
  @IsString()
  token: string;
}
