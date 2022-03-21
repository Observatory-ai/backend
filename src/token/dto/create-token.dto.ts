import { TokenType } from '../enum/token-type.enum';

export class CreateTokenDto {
  uuid: string;
  userId: number;
  type: TokenType;
  expiresAt: Date;
}
