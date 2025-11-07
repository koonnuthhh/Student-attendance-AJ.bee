import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceRecord, AttendanceStatus, AttendanceSource } from './attendance-record.entity';
import { SessionsService } from '../sessions/sessions.service';
import { AuditService } from '@/common/audit.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRepo: Repository<AttendanceRecord>,
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

  async markViaQR(token: string, studentId: string, lat?: number, long?: number, accuracy?: number) {
    const sessionId = await this.sessionsService.verifyQRToken(token);
    if (!sessionId) throw new Error('Invalid or expired QR');
    
    // Idempotency: if already marked, return existing
    const existing = await this.attendanceRepo.findOne({ where: { sessionId, studentId } });
    if (existing) return existing;
    
    const record = this.attendanceRepo.create({
      sessionId,
      studentId,
      status: AttendanceStatus.PRESENT,
      markedBy: studentId,
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
    
    return saved;
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
