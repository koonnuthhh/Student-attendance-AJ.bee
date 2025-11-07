import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { User } from '../users/user.entity';
import { Enrollment } from '../students/enrollment.entity';
import { Session } from '../sessions/session.entity';

@Entity('classes')
export class Class extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  subject: string;

  @Column()
  teacherId: string;

  @ManyToOne(() => User, (user) => user.classes)
  @JoinColumn({ name: 'teacherId' })
  teacher: User;

  @Column({ nullable: true })
  timezone: string;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.class)
  enrollments: Enrollment[];

  @OneToMany(() => Session, (session) => session.class)
  sessions: Session[];
}
