import { BadRequestException } from '@nestjs/common';

/**
 * An exception that is thrown when an email is already in use by another user
 */
export class EmailInUseException extends BadRequestException {
  constructor() {
    super(`email:EMAIL_IN_USE`);
  }
}
