import { Request } from "express";
import { User } from "../user/user.entity";

interface RequestWithUserAndAccessToken extends Request {
  user?: User;
  accessToken?: string;
}

export { RequestWithUserAndAccessToken };
