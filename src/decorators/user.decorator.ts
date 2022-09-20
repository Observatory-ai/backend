import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "../user/user.entity";
import { RequestWithUserAndAccessToken } from "../utils/requests.interface";
/**
 * A method decorator that extracts a user or user property from the request
 */
export const ReqUser = createParamDecorator(
  (field: string, ctx: ExecutionContext) => {
    const request: RequestWithUserAndAccessToken = ctx
      .switchToHttp()
      .getRequest();
    const user: User = request.user;
    return field ? user?.[field] : user;
  },
);
