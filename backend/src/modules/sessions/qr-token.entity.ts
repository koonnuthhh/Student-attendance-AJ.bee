import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Session } from './session.entity';

@Entity('qr_tokens')
export class QRToken extends BaseEntity {
  @Column()
  sessionId: string;

  @Column({ length: 5, comment: '5-digit QR token code' })
  token: string;

  @Column()
  expiresAt: Date;

  @Column({ nullable: true })
  rotatedAt: Date;

  @OneToOne(() => Session, (session) => session.qrToken)
  @JoinColumn({ name: 'sessionId' })
  session: Session;
}
