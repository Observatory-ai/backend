import { NotFoundException } from '@nestjs/common';

/**
 * An exception that is thrown when the user with the give email
 * was not found
 */
export class UserNotFoundException extends NotFoundException {
  constructor(email: string) {
    super(`usernameOrEmail:User with email or username ${email} not found`);
  }
}

/**
 * An exception that is thrown when the user with the given id
 * was not found
 */
export class UserWithIdNotFoundException extends NotFoundException {
  constructor(id: string | number) {
    super(`general:User with id ${id} not found`);
  }
}
