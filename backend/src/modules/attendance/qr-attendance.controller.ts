import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
@UseGuards(AuthGuard('jwt'))
export class QRAttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('qr-scan')
  async qrScan(
    @Body() body: any,
    @Body('code') code: string,
    @Body('studentId') userId: string, // This is actually the user ID from frontend
    @Body('lat') lat?: number,
    @Body('long') long?: number,
    @Body('accuracy') accuracy?: number,
  ) {
    console.log('QR Scan request received:', { body, code, userId, lat, long, accuracy });
    
    if (!code || !userId) {
      console.error('Missing required fields:', { code: !!code, userId: !!userId });
      throw new Error('Missing required fields: code and userId');
    }
    
    return this.attendanceService.markViaQR(code, userId, lat, long, accuracy);
  }
}