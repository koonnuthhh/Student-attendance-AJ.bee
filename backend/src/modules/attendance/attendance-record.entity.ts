import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Session } from '../sessions/session.entity';
import { Student } from '../students/student.entity';

export enum AttendanceStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  LATE = 'Late',
  EXCUSED = 'Excused',
  LEAVE = 'Leave',
}

export enum AttendanceSource {
  MANUAL = 'manual',
  QR = 'qr',
  API = 'api',
  BIOMETRIC = 'biometric',
}

@Entity('attendance_records')
export class AttendanceRecord extends BaseEntity {
  @Column()
  sessionId: string;

  @Column()
  studentId: string;

  @Column({ type: 'enum', enum: AttendanceStatus })
  status: AttendanceStatus;

  @Column({ nullable: true, length: 200 })
  note: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lat: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  long: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  accuracy: number;

  @Column()
  markedBy: string;

  @Column()
  markedAt: Date;

  @Column({ type: 'enum', enum: AttendanceSource, default: AttendanceSource.MANUAL })
  source: AttendanceSource;

  @ManyToOne(() => Session, (session) => session.attendanceRecords)
  @JoinColumn({ name: 'sessionId' })
  session: Session;

  @ManyToOne(() => Student, (student) => student.attendanceRecords)
  @JoinColumn({ name: 'studentId' })
  student: Student;
}
