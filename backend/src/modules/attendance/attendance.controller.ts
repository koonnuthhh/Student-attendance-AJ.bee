import { Controller, Post, Get, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AttendanceService } from './attendance.service';
import { AttendanceStatus } from './attendance-record.entity';

@Controller('sessions/:sid/attendance')
@UseGuards(AuthGuard('jwt'))
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('bulk')
  async bulkMark(
    @Param('sid') sid: string,
    @Req() req,
    @Body('defaultStatus') defaultStatus: AttendanceStatus,
    @Body('overrides') overrides: any[],
  ) {
    return this.attendanceService.markBulk(sid, defaultStatus, overrides, req.user.userId);
  }

  @Post('qr-scan')
  async qrScan(
    @Body('code') code: string,
    @Body('studentId') studentId: string,
    @Body('lat') lat?: number,
    @Body('long') long?: number,
    @Body('accuracy') accuracy?: number,
  ) {
    return this.attendanceService.markViaQR(code, studentId, lat, long, accuracy);
  }

  @Get()
  async findAll(@Param('sid') sid: string) {
    return this.attendanceService.findBySession(sid);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req,
    @Body('status') status: AttendanceStatus,
    @Body('note') note?: string,
  ) {
    return this.attendanceService.update(id, status, note, req.user.userId);
  }
}
