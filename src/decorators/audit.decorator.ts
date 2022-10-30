import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import { AuditActionDto } from '../audit/enums/audit-action.enum';
import { AuditResourceDto } from '../audit/enums/audit-resource.enum';
import { AuditInterceptor } from '../interceptors/audit.interceptor';

/**
 * The audit action metadata key, used to extract the audit action from a method
 */
export const AUDIT_ACTION_KEY = 'audit_action';
/**
 * The audit resource metadata key, used to extract the audit resource from a method
 */
export const AUDIT_RESOURCE_KEY = 'audit_resource';

/**
 * A decorator that applies the audit action metadata, audit resource metadata and audit
 * interceptor to a method
 * @param auditAction the audit action
 * @param auditResource the audit resource
 * @returns a fully configured audit decorator
 */
export function Audit(
  auditAction: AuditActionDto,
  auditResource: AuditResourceDto,
) {
  return applyDecorators(
    SetMetadata(AUDIT_ACTION_KEY, auditAction),
    SetMetadata(AUDIT_RESOURCE_KEY, auditResource),
    UseInterceptors(AuditInterceptor),
  );
}
