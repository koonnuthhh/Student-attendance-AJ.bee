import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ClassesModule } from './modules/classes/classes.module';
import { StudentsModule } from './modules/students/students.module';
import { StudentCodesModule } from './modules/student-codes/student-codes.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { LeaveModule } from './modules/leave/leave.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ExportsModule } from './modules/exports/exports.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { AuditModule } from './common/audit.module';

// Import all entities explicitly
import { User } from './modules/users/user.entity';
import { Role } from './modules/users/role.entity';
import { VerificationToken } from './modules/users/verification-token.entity';
import { Class } from './modules/classes/class.entity';
import { Student } from './modules/students/student.entity';
import { Enrollment } from './modules/students/enrollment.entity';
import { Session } from './modules/sessions/session.entity';
import { QRToken } from './modules/sessions/qr-token.entity';
import { AttendanceRecord } from './modules/attendance/attendance-record.entity';
import { LeaveRequest } from './modules/leave/leave-request.entity';
import { LeaveBalance } from './modules/leave/leave-balance.entity';
import { Notification } from './modules/notifications/notification.entity';
import { AuditLog } from './common/audit-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [
        User,
        Role,
        VerificationToken,
        Class,
        Student,
        Enrollment,
        Session,
        QRToken,
        AttendanceRecord,
        LeaveRequest,
        LeaveBalance,
        Notification,
        AuditLog,
      ],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }),
    AuditModule,
    AuthModule,
    UsersModule,
    ClassesModule,
    StudentsModule,
    StudentCodesModule,
    SessionsModule,
    AttendanceModule,
    LeaveModule,
    NotificationsModule,
    ExportsModule,
    RealtimeModule,
  ],
})
export class AppModule {}
