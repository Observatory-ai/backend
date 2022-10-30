import { AuditActionDto } from '../enums/audit-action.enum';
import { AuditResourceDto } from '../enums/audit-resource.enum';

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
