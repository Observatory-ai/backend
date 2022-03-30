import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BaseEntity,
} from 'typeorm';
import { Token } from '../token/token.entity';
import { AuditLog } from '../audit/audit-log.entity';
import { AuthMethod } from './enum/auth-method.enum';
import { Locale } from './enum/locale.enum';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'uuid', unique: true, nullable: false })
  uuid: string;

  @Column({ unique: true, nullable: true })
  googleId: string;

  @Column({ nullable: true })
  refreshToken?: string;

  @Index({ unique: true })
  @Column({ unique: true, nullable: false, length: 50 })
  email: string;

  @Index({ unique: true })
  @Column({ unique: true, nullable: false, length: 50 })
  username: string;

  @Column({ nullable: false, length: 100 })
  password: string;

  @Column({ nullable: false, default: false })
  isActive: boolean;

  @Column({ nullable: false, default: false })
  isVerified: boolean;

  // for facebook and google login
  @Column({ nullable: true })
  firstName: string;

  // for facebook and google login
  @Column({ nullable: true })
  lastName: string;

  @Column({ type: 'enum', enum: AuthMethod, nullable: false })
  authMethod: AuthMethod;

  @Column({ type: 'enum', enum: Locale, nullable: true })
  locale: Locale;

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.user)
  auditLogs: Promise<AuditLog[]>;

  @Column({ nullable: true })
  avatar: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
