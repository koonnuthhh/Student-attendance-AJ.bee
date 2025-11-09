import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SessionsService } from './sessions.service';

@Controller('sessions')
@UseGuards(AuthGuard('jwt'))
export class GlobalSessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get(':sessionId/qr-token')
  async getQRToken(@Param('sessionId') sessionId: string) {
    return this.sessionsService.generateQRToken(sessionId);
  }

  @Get(':sessionId')
  async getSession(@Param('sessionId') sessionId: string) {
    return this.sessionsService.findById(sessionId);
  }
}