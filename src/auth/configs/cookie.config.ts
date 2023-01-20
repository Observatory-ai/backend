import { CookieOptions } from 'express';

/**
 * Represents the type of authentication token the server sets in
 * the browser using cookies
 */
enum AuthTokenType {
  Access = 'ACCESS',
  Refresh = 'REFRESH',
}

/**
 * Represents all the cookie configuration settings
 */
interface CookieConfig {
  name: string;
  cookieOptions: CookieOptions;
  expirationTime: number;
}

/**
 * Contains the cookie configuration for all authentication token types
 */
const COOKIE_CONFIG: Record<AuthTokenType, CookieConfig> = {
  ACCESS: {
    name: 'jwt_access',
    cookieOptions: {
      httpOnly: true,
      path: '/',
    },
    // 15 minutes
    expirationTime: 900, // 900
  },
  REFRESH: {
    name: 'jwt',
    cookieOptions: {
      httpOnly: true,
      path: '/',
      // sameSite: 'none',
      // secure: true,
    },
    // 1 week
    expirationTime: 604800, // 604800
  },
};

export { AuthTokenType, CookieConfig, COOKIE_CONFIG };
