import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Response } from "express";
import { Observable, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { AuditService } from "../audit/audit.service";
import { CreateAuditLogDto } from "../audit/dto/create-audit-log.dto";
import { AuditActionDto } from "../audit/enum/audit-action.enum";
import { AuditResourceDto } from "../audit/enum/audit-resource.enum";
import {
  AUDIT_ACTION_KEY,
  AUDIT_RESOURCE_KEY,
} from "../decorators/audit.decorator";
import { User } from "../user/user.entity";
import { UserService } from "../user/user.service";
import { RequestWithUserAndAccessToken } from "../utils/requests.interface";

/**
 * An interceptor that records every action performed by every user
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
    private readonly userService: UserService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const auditAction: AuditActionDto = this.reflector.get<AuditActionDto>(
      AUDIT_ACTION_KEY,
      context.getHandler(),
    );
    const auditResource: AuditResourceDto =
      this.reflector.get<AuditResourceDto>(
        AUDIT_RESOURCE_KEY,
        context.getHandler(),
      );
    const request: RequestWithUserAndAccessToken = context
      .switchToHttp()
      .getRequest();
    const response: Response = context.switchToHttp().getResponse();
    const user: User = request.user;
    return next.handle().pipe(
      tap(() => {
        const auditLog: CreateAuditLogDto = {
          isSuccessful:
            response.statusCode >= 200 && response.statusCode <= 299,
          action: auditAction,
          resource: auditResource,
          userAgent: request.get("user-agent") || "",
          ip: request.ip,
          userId: user.id,
        };
        this.auditService.create(auditLog);
      }),
      catchError((err: any) => {
        let failureReason: any = err.response?.message;
        if (Array.isArray(failureReason)) {
          failureReason = failureReason.toString();
        }
        const auditLog: CreateAuditLogDto = {
          isSuccessful: false,
          failureReason,
          action: auditAction,
          resource: auditResource,
          userAgent: request.get("user-agent") || "",
          ip: request.ip,
          userId: user.id,
        };
        this.auditService.create(auditLog);
        return throwError(err);
      }),
    );
  }
}
