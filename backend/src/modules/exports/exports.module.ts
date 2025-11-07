import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceRecord } from '../attendance/attendance-record.entity';
import { ExportsController } from './exports.controller';
import { ExportsService } from './exports.service';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceRecord])],
  providers: [ExportsService],
  controllers: [ExportsController],
})
export class ExportsModule {}
