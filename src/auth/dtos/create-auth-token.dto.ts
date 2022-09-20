import { IsNumber, IsString } from "class-validator";

export class CreateAuthTokenDto {
  @IsNumber()
  userId: number;

  @IsString()
  refreshToken: string;

  @IsString()
  userAgent: string;
}
