import { BadRequestException } from '@nestjs/common';

/**
 * An exception that is thrown when a user supplies invalid login
 * credentials
 */
export class InvalidCredentialsException extends BadRequestException {
  constructor() {
    super('login:INVALID_CREDENTIALS');
  }
}
