import { ForbiddenException } from '@nestjs/common';

/**
 * An exception that is thrown when a users account is disabled
 */
export class AccountDisabledException extends ForbiddenException {
  constructor(email: string) {
    super(`email:Account with email ${email} is disabled`);
  }
}
