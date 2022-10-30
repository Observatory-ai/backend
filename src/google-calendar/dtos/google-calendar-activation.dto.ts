import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GoogleCalendarActivationDto {
  @ApiProperty()
  @IsString()
  accessToken: string;
}
