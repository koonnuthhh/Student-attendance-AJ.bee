import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

export enum TokenType {
  EMAIL_VERIFICATION = 'email',
  PASSWORD_RESET = 'reset',
}

@Entity('verification_tokens')
export class VerificationToken extends BaseEntity {
  @Column()
  userId: string;

  @Column({ type: 'enum', enum: TokenType })
  type: TokenType;

  @Column()
  token: string;

  @Column()
  expiresAt: Date;

  @Column({ nullable: true })
  usedAt: Date;
}
