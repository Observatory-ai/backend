import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Match } from '../../decorators/match.decorator';

export class SignUpDto {
  @ApiProperty()
  @IsNotEmpty({
    message: 'email:EMAIL_REQUIRED',
  })
  @MaxLength(250, {
    message: 'email:EMAIL_TOO_LONG',
  })
  @IsEmail(
    {},
    {
      message: 'email:INVALID_EMAIL',
    },
  )
  email: string;

  @ApiProperty()
  @IsNotEmpty({
    message: 'firstName:FIRST_NAME_REQUIRED',
  })
  firstName: string;

  @ApiProperty()
  @IsNotEmpty({
    message: 'lastName:LAST_NAME_REQUIRED',
  })
  lastName: string;

  @ApiProperty()
  @IsNotEmpty({
    message: 'username:USERNAME_REQUIRED',
  })
  @MinLength(3, {
    message: 'username:USERNAME_TOO_SHORT',
  })
  @MaxLength(256, {
    message: 'username:USERNAME_TOO_LONG',
  })
  @IsString()
  username: string;

  @ApiProperty()
  @IsNotEmpty({
    message: 'password:PASSWORD_REQUIRED',
  })
  @IsString()
  @MinLength(8, {
    message: 'password:PASSWORD_TOO_SHORT',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/, {
    message: 'password:PASSWORD_NOT_SECURE', //Password must contain at least one uppercase letter, one lowercase letter, one number and one special character
  })
  password: string;

  @ApiProperty()
  @IsNotEmpty({
    message: 'confirmPassword:CONFIRM_PASSWORD_REQUIRED',
  })
  @IsString()
  @Match('password', {
    message: 'confirmPassword:PASSWORDS_DO_NOT_MATCH',
  })
  confirmPassword: string;
}
