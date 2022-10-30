import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { AuditActionDto } from './enums/audit-action.enum';
import { AuditResourceDto } from './enums/audit-resource.enum';

@Entity()
export class AuditLog extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  isSuccessful: boolean;

  @Column({ nullable: true })
  failureReason?: string;

  @Column({
    type: 'enum',
    enum: AuditActionDto,
  })
  action: AuditActionDto;

  @Column({
    type: 'enum',
    enum: AuditResourceDto,
  })
  resource: AuditResourceDto;

  @Column()
  userAgent: string;

  @Column()
  ip: string;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.auditLogs)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
