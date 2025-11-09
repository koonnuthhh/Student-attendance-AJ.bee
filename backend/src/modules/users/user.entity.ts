import { Entity, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Role } from './role.entity';
import { Class } from '../classes/class.entity';
import { LeaveRequest } from '../leave/leave-request.entity';

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING_VERIFICATION })
  status: UserStatus;

  @Column({ nullable: true })
  emailVerifiedAt: Date;

  @Column({ nullable: true })
  locale: string;

  @Column({ 
    unique: true, 
    nullable: true, 
    length: 5,
    name: 'student_code',
    comment: 'Unique 5-digit student identification code for class enrollment'
  })
  studentCode?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'student_code_generated_at',
    comment: 'When the student code was generated'
  })
  studentCodeGeneratedAt?: Date;

  @Column({
    default: false,
    name: 'student_code_used',
    comment: 'Whether the student code has been used for registration'
  })
  studentCodeUsed: boolean;

  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable({ name: 'user_roles' })
  roles: Role[];

  @OneToMany(() => Class, (cls) => cls.teacher)
  classes: Class[];

  @OneToMany(() => LeaveRequest, (req) => req.user)
  leaveRequests: LeaveRequest[];
}
