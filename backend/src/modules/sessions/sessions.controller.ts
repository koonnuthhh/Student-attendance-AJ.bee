import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SessionsService } from './sessions.service';

@Controller('classes/:classId/sessions')
@UseGuards(AuthGuard('jwt'))
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  async create(
    @Param('classId') classId: string,
    @Body('date') date: string,
    @Body('startTime') startTime?: string,
    @Body('endTime') endTime?: string,
  ) {
    return this.sessionsService.create(classId, new Date(date), startTime, endTime);
  }

  @Get()
  async findAll(@Param('classId') classId: string) {
    return this.sessionsService.findByClass(classId);
  }

  @Get(':sid/qr-token')
  async getQRToken(@Param('sid') sid: string) {
    return this.sessionsService.generateQRToken(sid);
  }

  @Delete(':sid')
  async remove(@Param('sid') sessionId: string) {
    return this.sessionsService.remove(sessionId);
  }
}
