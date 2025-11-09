import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceRecord, AttendanceStatus, AttendanceSource } from './attendance-record.entity';
import { SessionsService } from '../sessions/sessions.service';
import { AuditService } from '../../common/audit.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { Student } from '../students/student.entity';
import { User } from '../users/user.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRepo: Repository<AttendanceRecord>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly sessionsService: SessionsService,
    private readonly auditService: AuditService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async markBulk(sessionId: string, defaultStatus: AttendanceStatus, overrides: any[], markedBy: string) {
    const records = overrides.map((o) =>
      this.attendanceRepo.create({
        sessionId,
        studentId: o.studentId,
        status: o.status || defaultStatus,
        note: o.note,
        markedBy,
        markedAt: new Date(),
        source: AttendanceSource.MANUAL,
      }),
    );
    
    const saved = await this.attendanceRepo.save(records);
    
    // Broadcast real-time updates
    saved.forEach((record) => {
      this.realtimeGateway.broadcastAttendanceUpdate(sessionId, {
        sessionId: record.sessionId,
        studentId: record.studentId,
        status: record.status,
        markedBy: record.markedBy,
        markedAt: record.markedAt,
      });
    });
    
    return saved;
  }

  async markViaQR(token: string, userId: string, lat?: number, long?: number, accuracy?: number) {
    // Validate input
    if (!token || !userId) {
      throw new Error('Missing required fields: token and userId');
    }

    // Verify token and get sessionId
    const sessionId = await this.sessionsService.verifyQRToken(token);
    if (!sessionId) {
      throw new Error('Invalid or expired QR code');
    }

    // Find the student record for this user
    // First, try to find by user's student code or email
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    let student = null;
    if (user.studentCode) {
      student = await this.studentRepo.findOne({ 
        where: { studentId: user.studentCode } 
      });
    }
    
    // If no student record found by student code, try by email
    if (!student && user.email) {
      student = await this.studentRepo.findOne({ 
        where: { email: user.email } 
      });
    }

    // If still no student record, create one
    if (!student) {
      const [firstName, ...lastNameParts] = user.name.split(' ');
      const lastName = lastNameParts.join(' ') || '';
      
      student = this.studentRepo.create({
        firstName,
        lastName,
        studentId: user.studentCode || user.id,
        email: user.email,
      });
      
      student = await this.studentRepo.save(student);
    }

    // Check if student is enrolled in the class for this session
    // This would require adding enrollment check logic here if needed
    
    // Idempotency: if already marked, return existing record
    const existing = await this.attendanceRepo.findOne({ 
      where: { sessionId, studentId: student.id },
      relations: ['session'] 
    });
    
    if (existing) {
      return {
        ...existing,
        message: 'Attendance already marked for this session'
      };
    }
    
    // Create new attendance record
    const record = this.attendanceRepo.create({
      sessionId,
      studentId: student.id,
      status: AttendanceStatus.PRESENT,
      markedBy: userId,
      markedAt: new Date(),
      source: AttendanceSource.QR,
      lat,
      long,
      accuracy,
    });
    
    const saved = await this.attendanceRepo.save(record);
    
    // Broadcast real-time update
    this.realtimeGateway.broadcastAttendanceUpdate(sessionId, {
      sessionId: saved.sessionId,
      studentId: saved.studentId,
      status: saved.status,
      markedBy: saved.markedBy,
      markedAt: saved.markedAt,
    });
    
    return {
      ...saved,
      message: 'Attendance marked successfully'
    };
  }

  async findBySession(sessionId: string) {
    return this.attendanceRepo.find({ where: { sessionId }, relations: ['student'] });
  }

  async update(id: string, status: AttendanceStatus, note?: string, updatedBy?: string) {
    const original = await this.attendanceRepo.findOne({ where: { id } });
    if (!original) throw new Error('Attendance record not found');
    
    const changes: Record<string, any> = {};
    if (original.status !== status) {
      changes.status = { from: original.status, to: status };
    }
    if (original.note !== note) {
      changes.note = { from: original.note, to: note };
    }
    
    await this.attendanceRepo.update(id, { status, note });
    
    // Log audit trail
    if (Object.keys(changes).length > 0) {
      await this.auditService.log(
        'AttendanceRecord',
        id,
        'update',
        updatedBy || 'system',
        changes,
      );
    }
    
    const updated = await this.attendanceRepo.findOne({ where: { id } });
    
    // Broadcast real-time update
    if (updated) {
      this.realtimeGateway.broadcastAttendanceUpdate(updated.sessionId, {
        sessionId: updated.sessionId,
        studentId: updated.studentId,
        status: updated.status,
        markedBy: updatedBy || 'system',
        markedAt: new Date(),
      });
    }
    
    return updated;
  }
}
