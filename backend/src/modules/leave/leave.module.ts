import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveRequest } from './leave-request.entity';
import { LeaveBalance } from './leave-balance.entity';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { AttendanceModule } from '../attendance/attendance.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveRequest, LeaveBalance, User]),
    AttendanceModule,
    NotificationsModule,
    UsersModule,
  ],
  providers: [LeaveService],
  controllers: [LeaveController],
})
export class LeaveModule {}
