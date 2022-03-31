import { User } from '../user/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ServiceType } from './enum/service-type.enum';
import { Api } from './enum/api.enum';

@Entity()
export class Service extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ServiceType, nullable: false })
  service: ServiceType;

  @Column({ nullable: true })
  refreshToken: string;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.services)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: Api, array: true, nullable: true })
  apis: Api[];

  @Column({ nullable: false, default: false })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
