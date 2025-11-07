import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('audit_logs')
export class AuditLog extends BaseEntity {
  @Column()
  entity: string;

  @Column()
  entityId: string;

  @Column()
  action: string;

  @Column()
  changedBy: string;

  @Column({ type: 'jsonb' })
  changes: Record<string, any>;
}
