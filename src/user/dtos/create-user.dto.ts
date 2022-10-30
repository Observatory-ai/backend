import { AuthMethod } from '../enums/auth-method.enum';
import { Locale } from '../enums/locale.enum';

export class CreateUserDto {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  uuid: string;
  avatar: string;
  googleId: string;
  isVerified: boolean;
  locale: Locale;
  authMethod: AuthMethod;
}
