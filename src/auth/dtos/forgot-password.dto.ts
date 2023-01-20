import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class ForgotPasswordDto {
  @Field()
  @IsNotEmpty({
    message: 'Email can not be empty',
  })
  @IsString()
  @IsEmail({
    message: 'Invalid email',
  })
  email: string;
}
