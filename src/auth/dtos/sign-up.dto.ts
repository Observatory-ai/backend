import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
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
    message: 'Email can not be empty',
  })
  @MaxLength(250, {
    message: 'Email too long',
  })
  @IsEmail(
    {},
    {
      message: 'Invalid email',
    },
  )
  email: string;

  @ApiProperty()
  @IsNotEmpty({
    message: 'Username can not be empty',
  })
  @MinLength(3, {
    message: 'Username must be at least 3 characters',
  })
  @MaxLength(256, {
    message: 'Username can not exceed 256 characters',
  })
  @IsString()
  username: string;

  @ApiProperty()
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

  @ApiProperty()
  @IsNotEmpty({
    message: 'Confirm password can not be empty',
  })
  @IsString()
  @Match('password', {
    message: 'Passwords do not match',
  })
  confirmPassword: string;

  @ApiProperty()
  @IsNotEmpty({
    message: 'Birthday can not be empty',
  })
  @IsDate({ message: 'Invalid birthday' })
  @Type(() => Date)
  birthday: Date;
}
