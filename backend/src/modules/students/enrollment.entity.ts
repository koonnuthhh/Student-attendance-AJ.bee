import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Class } from '../classes/class.entity';
import { Student } from './student.entity';

export enum EnrollmentStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

@Entity('enrollments')
@Unique(['classId', 'studentId'])
export class Enrollment extends BaseEntity {
  @Column()
  classId: string;

  @Column()
  studentId: string;

  @Column({ type: 'enum', enum: EnrollmentStatus, default: EnrollmentStatus.ACTIVE })
  status: EnrollmentStatus;

  @ManyToOne(() => Class, (cls) => cls.enrollments)
  @JoinColumn({ name: 'classId' })
  class: Class;

  @ManyToOne(() => Student, (student) => student.enrollments)
  @JoinColumn({ name: 'studentId' })
  student: Student;
}
