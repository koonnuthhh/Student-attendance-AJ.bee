import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

export enum NotificationStatus {
  QUEUED = 'queued',
  SENT = 'sent',
  FAILED = 'failed',
}

@Entity('notifications')
export class Notification extends BaseEntity {
  @Column()
  userId: string;

  @Column()
  type: string;

  @Column({ type: 'enum', enum: NotificationChannel })
  channel: NotificationChannel;

  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.QUEUED })
  status: NotificationStatus;
}
