import { Exclude, Expose } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

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

  @Expose()
  @IsString()
  accessToken: string;
}
