import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '../user/user.entity';
/**
 * A method decorator that extracts a user or user property from the request
 */
export const ReqUser = createParamDecorator(
  (field: string, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context).getContext();
    const user: User = ctx.req.user;
    return field ? user?.[field] : user;
  },
);
