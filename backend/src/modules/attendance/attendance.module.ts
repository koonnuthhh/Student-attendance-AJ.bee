import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceRecord } from './attendance-record.entity';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { QRAttendanceController } from './qr-attendance.controller';
import { SessionsModule } from '../sessions/sessions.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { Student } from '../students/student.entity';
import { User } from '../users/user.entity';
import { AuditModule } from '../../common/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttendanceRecord, Student, User]),
    SessionsModule,
    RealtimeModule,
    AuditModule,
  ],
  providers: [AttendanceService],
  controllers: [AttendanceController, QRAttendanceController],
  exports: [AttendanceService],
})
export class AttendanceModule {}
