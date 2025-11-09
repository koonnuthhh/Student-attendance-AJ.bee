import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './session.entity';
import { QRToken } from './qr-token.entity';
import { AttendanceRecord } from '../attendance/attendance-record.entity';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { GlobalSessionsController } from './global-sessions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Session, QRToken, AttendanceRecord])],
  providers: [SessionsService],
  controllers: [SessionsController, GlobalSessionsController],
  exports: [SessionsService],
})
export class SessionsModule {}
