import { IsNumber, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @Expose()
  @IsNumber()
  uuid: number;

  @Expose()
  @IsString()
  email: string;

  @Expose()
  @IsString()
  username: string;
}
