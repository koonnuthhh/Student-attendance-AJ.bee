import { Controller, Post, Get, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LeaveService } from './leave.service';

@Controller('leave')
@UseGuards(AuthGuard('jwt'))
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  async create(
    @Req() req,
    @Body('type') type: string,
    @Body('start') start: string,
    @Body('end') end: string,
    @Body('reason') reason?: string,
  ) {
    return this.leaveService.create(req.user.userId, type, new Date(start), new Date(end), reason);
  }

  @Get()
  async findMine(@Req() req) {
    return this.leaveService.findByUser(req.user.userId);
  }

  @Get('pending')
  async findPending() {
    return this.leaveService.findPending();
  }

  @Patch(':id/approve')
  async approve(@Param('id') id: string, @Req() req, @Body('comment') comment?: string) {
    return this.leaveService.approve(id, req.user.userId, comment);
  }

  @Patch(':id/reject')
  async reject(@Param('id') id: string, @Req() req, @Body('comment') comment?: string) {
    return this.leaveService.reject(id, req.user.userId, comment);
  }
}
