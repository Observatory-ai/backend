import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty()
  @IsString()
  emailOrUsername: string;

  @ApiProperty()
  @IsString()
  password: string;
}
