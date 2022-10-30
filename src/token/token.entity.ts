import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { TokenType } from './enums/token-type.enum';

@Entity()
export class Token extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'uuid', unique: true, nullable: false })
  uuid: string;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.tokens)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: TokenType, nullable: false })
  type: TokenType;

  @Column({ type: 'date', nullable: false })
  expiresAt: Date;
}
