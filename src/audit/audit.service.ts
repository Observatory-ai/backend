import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditLog } from './audit-log.entity';
import { AuditRepository } from './audit.repository';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Injectable()
export class AuditService {
  private readonly logger: Logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditRepository)
    private readonly auditRepository: AuditRepository,
  ) {}

  /**
   * Create an audit log
   * @param createAuditLogDto the audit log to create
   * @returns the created audit log document
   */
  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    return this.auditRepository.createAndSave(createAuditLogDto);
  }

  /**
   * Cron job that runs every hour and deletes audit logs that have been
   * created 28 days ago or greater
   */
  @Cron(CronExpression.EVERY_HOUR)
  private async deleteExpiredAuditLogsJob(): Promise<void> {
    this.logger.log('Delete expired audit logs cron job running');
    const deletedCount = await this.auditRepository.deleteExpiredAudits();
    this.logger.log(
      `Delete expired audit logs cron job finished - ${deletedCount} audit logs deleted`,
    );
  }
}
