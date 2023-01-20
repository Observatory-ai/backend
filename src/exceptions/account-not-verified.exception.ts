import { ForbiddenException } from '@nestjs/common';

/**
 * An exception that is thrown when a users account is not verified
 */
export class AccountNotVerifiedException extends ForbiddenException {
  constructor(email: string) {
    super(`email:Account with email ${email} is not verified`);
  }
}
