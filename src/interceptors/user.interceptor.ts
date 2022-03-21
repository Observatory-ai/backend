import { Request } from 'express';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from '../user/user.service';

/**
 * An interceptor that extracts the user id from the request and checks
 * whether the user exists or not
 */
@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(private readonly userService: UserService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request: Request = context.switchToHttp().getRequest();
    const userId: string = request.params.userId;
    await this.userService.doesExist(userId);
    return next.handle();
  }
}
