import { AuthMethod } from '../enum/auth-method.enum';
import { Locale } from '../enum/locale.enum';

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
