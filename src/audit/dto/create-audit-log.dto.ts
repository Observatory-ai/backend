import { AuditActionDto } from '../enum/audit-action.enum';
import { AuditResourceDto } from '../enum/audit-resource.enum';

export declare class CreateAuditLogDto {
  isSuccessful: boolean;
  failureReason?: string;
  action: AuditActionDto;
  resource: AuditResourceDto;
  userAgent: string;
  ip: string;
  userId: number;
  constructor(obj: CreateAuditLogDto);
}
