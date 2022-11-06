import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class GoogleCalendarEventsDto {
  @ApiProperty()
  @IsString()
  timeMin: string;

  @ApiProperty()
  @IsString()
  timeMax: string;

  @ApiProperty()
  @IsString()
  orderBy: string;

  @ApiProperty()
  @IsBoolean()
  singleEvents: boolean;
}
