import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../user/user.entity";

@Entity()
export class AuthToken extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.tokens)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ nullable: false })
  refreshToken: string;

  @Column({ nullable: true }) // could become required in the future (might be useful if we want to detect a connection from somewhere and send an email)
  ip: string;

  @Column({ nullable: false })
  userAgent: string;
}
