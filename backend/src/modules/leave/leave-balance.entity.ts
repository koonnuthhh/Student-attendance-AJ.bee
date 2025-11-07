import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('leave_balances')
export class LeaveBalance extends BaseEntity {
  @Column()
  userId: string;

  @Column()
  type: string;

  @Column({ type: 'decimal', precision: 5, scale: 1, default: 0 })
  remaining: number;
}
