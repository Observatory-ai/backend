import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty()
  @IsNotEmpty({
    message: 'Email can not be empty',
  })
  @IsString()
  @IsEmail({
    message: 'Invalid email',
  })
  email: string;
}
