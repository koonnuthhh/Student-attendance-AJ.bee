import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './session.entity';
import { QRToken } from './qr-token.entity';
import { AttendanceRecord } from '../attendance/attendance-record.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    @InjectRepository(QRToken)
    private readonly qrTokenRepo: Repository<QRToken>,
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRepo: Repository<AttendanceRecord>,
  ) {}

  /**
   * Generate a 5-digit numeric code for QR tokens
   */
  private generateFiveDigitCode(): string {
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return code;
  }

  async create(classId: string, date: Date, startTime?: string, endTime?: string) {
    const session = this.sessionRepo.create({ classId, date, startTime, endTime });
    return this.sessionRepo.save(session);
  }

  async findByClass(classId: string) {
    return this.sessionRepo.find({ where: { classId }, order: { date: 'DESC' } });
  }

  async findById(sessionId: string) {
    return this.sessionRepo.findOne({ where: { id: sessionId } });
  }

  async generateQRToken(sessionId: string) {
    // First check if session exists
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) {
      throw new Error('Session not found');
    }

    // Generate new 5-digit token
    const token = this.generateFiveDigitCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity
    
    // Update existing token or create new one
    const existing = await this.qrTokenRepo.findOne({ where: { sessionId } });
    if (existing) {
      existing.token = token;
      existing.expiresAt = expiresAt;
      existing.rotatedAt = new Date();
      const saved = await this.qrTokenRepo.save(existing);
      return {
        token: saved.token,
        expiresAt: saved.expiresAt,
        sessionId: saved.sessionId,
        message: 'QR token refreshed successfully'
      };
    }
    
    // Create new QR token
    const qr = this.qrTokenRepo.create({ sessionId, token, expiresAt });
    const saved = await this.qrTokenRepo.save(qr);
    
    return {
      token: saved.token,
      expiresAt: saved.expiresAt,
      sessionId: saved.sessionId,
      message: 'QR token generated successfully'
    };
  }

  async remove(sessionId: string) {
    // First check if session exists
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) {
      throw new Error('Session not found');
    }

    // Use transaction to ensure all deletions succeed or fail together
    await this.sessionRepo.manager.transaction(async (manager) => {
      // Delete all attendance records for this session first
      await manager.delete(AttendanceRecord, { sessionId });
      
      // Delete associated QR token if exists
      await manager.delete(QRToken, { sessionId });
      
      // Finally, delete the session
      await manager.delete(Session, { id: sessionId });
    });
    
    return { message: 'Session and all related records deleted successfully' };
  }

  async verifyQRToken(token: string) {
    if (!token) {
      return null;
    }

    const qr = await this.qrTokenRepo.findOne({ 
      where: { token },
      relations: ['session'] 
    });
    
    if (!qr) {
      return null; // Token not found
    }
    
    if (qr.expiresAt < new Date()) {
      return null; // Token expired
    }
    
    return qr.sessionId;
  }
}
