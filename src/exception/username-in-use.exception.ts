import { BadRequestException } from '@nestjs/common';

/**
 * An exception that is thrown when a username is already in use by another user
 */
export class UsernameInUseException extends BadRequestException {
  constructor() {
    super(`username:USERNAME_IN_USE`);
  }
}
