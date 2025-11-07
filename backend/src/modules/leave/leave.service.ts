import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { LeaveRequest, LeaveStatus } from './leave-request.entity';
import { AttendanceService } from '../attendance/attendance.service';
import { AttendanceStatus } from '../attendance/attendance-record.entity';
import { EmailService } from '../notifications/email.service';
import { User } from '../users/user.entity';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly leaveRepo: Repository<LeaveRequest>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly attendanceService: AttendanceService,
    private readonly emailService: EmailService,
  ) {}

  async create(userId: string, type: string, start: Date, end: Date, reason?: string) {
    const leave = this.leaveRepo.create({ userId, type, start, end, reason, status: LeaveStatus.SUBMITTED });
    return this.leaveRepo.save(leave);
  }

  async approve(id: string, approverId: string, comment?: string) {
    const leave = await this.leaveRepo.findOne({ where: { id }, relations: ['user'] });
    if (!leave) throw new Error('Leave request not found');
    
    await this.leaveRepo.update(id, {
      status: LeaveStatus.APPROVED,
      approverId,
      decidedAt: new Date(),
      approverComment: comment,
    });
    
    // Auto-update attendance records to Leave/Excused for the leave period
    // This would require finding all sessions between start and end dates
    // and marking attendance as Leave for the user
    try {
      await this.updateAttendanceForLeave(leave.userId, leave.start, leave.end);
    } catch (error) {
      console.error('Failed to update attendance for approved leave:', error);
    }
    
    // Send notification email
    const user = await this.userRepo.findOne({ where: { id: leave.userId } });
    if (user && user.email) {
      try {
        const emailTemplate = this.emailService.generateLeaveNotificationEmail(
          user.name,
          leave.type,
          leave.start.toISOString().split('T')[0],
          leave.end.toISOString().split('T')[0],
          'approved',
          comment,
        );
        await this.emailService.sendEmail(user.email, emailTemplate);
      } catch (error) {
        console.error('Failed to send leave approval email:', error);
      }
    }
    
    return this.leaveRepo.findOne({ where: { id } });
  }

  async reject(id: string, approverId: string, comment?: string) {
    const leave = await this.leaveRepo.findOne({ where: { id }, relations: ['user'] });
    if (!leave) throw new Error('Leave request not found');
    
    await this.leaveRepo.update(id, {
      status: LeaveStatus.REJECTED,
      approverId,
      decidedAt: new Date(),
      approverComment: comment,
    });
    
    // Send notification email
    const user = await this.userRepo.findOne({ where: { id: leave.userId } });
    if (user && user.email) {
      try {
        const emailTemplate = this.emailService.generateLeaveNotificationEmail(
          user.name,
          leave.type,
          leave.start.toISOString().split('T')[0],
          leave.end.toISOString().split('T')[0],
          'rejected',
          comment,
        );
        await this.emailService.sendEmail(user.email, emailTemplate);
      } catch (error) {
        console.error('Failed to send leave rejection email:', error);
      }
    }
    
    return this.leaveRepo.findOne({ where: { id } });
  }

  private async updateAttendanceForLeave(userId: string, startDate: Date, endDate: Date) {
    // This is a simplified version - in production, you'd need to:
    // 1. Find all sessions between startDate and endDate for classes the user is enrolled in
    // 2. Update or create attendance records with status = Leave
    // 3. Handle cases where attendance was already marked differently
    
    // For now, we'll log this action
    console.log(`Would update attendance for user ${userId} from ${startDate} to ${endDate} to Leave status`);
    
    // TODO: Implement full logic to update attendance records
    // This would require finding sessions and creating/updating attendance records
  }

  async findByUser(userId: string) {
    return this.leaveRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async findPending() {
    return this.leaveRepo.find({ where: { status: LeaveStatus.SUBMITTED }, order: { createdAt: 'ASC' } });
  }
}
