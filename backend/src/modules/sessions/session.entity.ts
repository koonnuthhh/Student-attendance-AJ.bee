import { Entity, Column, ManyToOne, OneToMany, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Class } from '../classes/class.entity';
import { AttendanceRecord } from '../attendance/attendance-record.entity';
import { QRToken } from './qr-token.entity';

export enum QRMode {
  SESSION = 'session',
  STUDENT = 'student',
  OFF = 'off',
}

@Entity('sessions')
export class Session extends BaseEntity {
  @Column()
  classId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time', nullable: true })
  startTime: string;

  @Column({ type: 'time', nullable: true })
  endTime: string;

  @Column({ type: 'enum', enum: QRMode, default: QRMode.OFF })
  qrMode: QRMode;

  @Column({ default: false })
  geoRequired: boolean;

  @ManyToOne(() => Class, (cls) => cls.sessions)
  @JoinColumn({ name: 'classId' })
  class: Class;

  @OneToMany(() => AttendanceRecord, (record) => record.session)
  attendanceRecords: AttendanceRecord[];

  @OneToOne(() => QRToken, (token) => token.session)
  qrToken: QRToken;
}
