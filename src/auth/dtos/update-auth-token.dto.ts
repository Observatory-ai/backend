import { IsString } from "class-validator";

export class UpdateAuthTokenDto {
  @IsString()
  refreshToken: string;

  @IsString()
  userAgent: string;
}
