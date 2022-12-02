import { BadRequestException } from '@nestjs/common';

/**
 * An exception that is thrown when an email is already in use by another user
 */
export class SamePasswordException extends BadRequestException {
  constructor() {
    super(`password:PASSWORD_SAME`);
  }
}
