import { Request } from 'express';
import { AuthToken } from '../auth/auth-token.entity';
import { User } from '../user/user.entity';

interface RequestWithUser extends Request {
  user?: User;
}

interface RequestWithAccessToken extends Request {
  accessToken?: string;
}

interface RequestWithRefreshToken extends Request {
  refreshToken?: AuthToken;
}

export { RequestWithUser, RequestWithAccessToken, RequestWithRefreshToken };
