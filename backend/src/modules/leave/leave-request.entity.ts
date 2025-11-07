import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { User } from '../users/user.entity';

export enum LeaveStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

@Entity('leave_requests')
export class LeaveRequest extends BaseEntity {
  @Column()
  userId: string;

  @Column()
  type: string;

  @Column({ type: 'date' })
  start: Date;

  @Column({ type: 'date' })
  end: Date;

  @Column({ nullable: true, length: 500 })
  reason: string;

  @Column({ type: 'enum', enum: LeaveStatus, default: LeaveStatus.DRAFT })
  status: LeaveStatus;

  @Column({ nullable: true })
  approverId: string;

  @Column({ nullable: true })
  decidedAt: Date;

  @Column({ nullable: true, length: 500 })
  approverComment: string;

  @ManyToOne(() => User, (user) => user.leaveRequests)
  @JoinColumn({ name: 'userId' })
  user: User;
}
