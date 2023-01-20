import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { Match } from '../../decorators/match.decorator';

@InputType()
export class ChangePasswordDto {
  @Field()
  @IsNotEmpty({
    message: 'Password can not be empty',
  })
  @IsString()
  @MinLength(8, {
    message: 'Password must be at least 8 characters',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
  })
  password: string;

  @Field()
  @IsNotEmpty({
    message: 'Confirm password can not be empty',
  })
  @IsString()
  @Match('password', {
    message: 'Passwords do not match',
  })
  confirmPassword: string;

  @Field()
  @IsString()
  token: string;
}
