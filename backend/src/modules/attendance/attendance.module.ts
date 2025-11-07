import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceRecord } from './attendance-record.entity';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { SessionsModule } from '../sessions/sessions.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttendanceRecord]),
    SessionsModule,
    RealtimeModule,
  ],
  providers: [AttendanceService],
  controllers: [AttendanceController],
  exports: [AttendanceService],
})
export class AttendanceModule {}
