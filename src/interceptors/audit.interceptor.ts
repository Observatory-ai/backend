import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuditService } from '../audit/audit.service';
import { CreateAuditLogDto } from '../audit/dtos/create-audit-log.dto';
import { AuditActionDto } from '../audit/enums/audit-action.enum';
import { AuditResourceDto } from '../audit/enums/audit-resource.enum';
import {
  AUDIT_ACTION_KEY,
  AUDIT_RESOURCE_KEY,
} from '../decorators/audit.decorator';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';

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
    const ctx = GqlExecutionContext.create(context);
    const auditAction: AuditActionDto = this.reflector.get<AuditActionDto>(
      AUDIT_ACTION_KEY,
      ctx.getHandler(),
    );
    const auditResource: AuditResourceDto =
      this.reflector.get<AuditResourceDto>(
        AUDIT_RESOURCE_KEY,
        ctx.getHandler(),
      );
    const { req, res } = ctx.getContext();
    const user: User = req.user;
    return next.handle().pipe(
      tap(() => {
        const auditLog: CreateAuditLogDto = {
          isSuccessful: res.statusCode >= 200 && res.statusCode <= 299,
          action: auditAction,
          resource: auditResource,
          userAgent: req.get('user-agent') || '',
          ip: req.ip,
          userId: user.id,
        };
        this.auditService.create(auditLog);
      }),
      catchError((err: any) => {
        let failureReason: any = err.res?.message;
        if (Array.isArray(failureReason)) {
          failureReason = failureReason.toString();
        }
        const auditLog: CreateAuditLogDto = {
          isSuccessful: false,
          failureReason,
          action: auditAction,
          resource: auditResource,
          userAgent: req.get('user-agent') || '',
          ip: req.ip,
          userId: user.id,
        };
        this.auditService.create(auditLog);
        return throwError(err);
      }),
    );
  }
}
