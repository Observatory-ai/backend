import { DateUtil } from '../utils/date.util';
import { EntityRepository, LessThanOrEqual, Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@EntityRepository(AuditLog)
export class AuditRepository extends Repository<AuditLog> {
  async createAndSave(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    const {
      action,
      failureReason,
      resource,
      userId,
      ip,
      isSuccessful,
      userAgent,
    } = createAuditLogDto;
    let auditLog = new AuditLog();
    auditLog.userAgent = userAgent;
    auditLog.action = action;
    auditLog.failureReason = failureReason;
    auditLog.resource = resource;
    auditLog.userId = userId;
    auditLog.ip = ip;
    auditLog.isSuccessful = isSuccessful;

    try {
      return await this.save(auditLog);
    } catch (err) {
      // TODO: throw error
      return undefined;
    }
  }

  async deleteExpiredAudits(): Promise<number> {
    const twentyEightDays: Date = DateUtil.removeDays(new Date(), 28);
    const result = await this.createQueryBuilder()
      .delete()
      .from(AuditLog)
      .where({ createdAt: LessThanOrEqual(twentyEightDays) })
      .execute();

    return result.affected;
  }
}
