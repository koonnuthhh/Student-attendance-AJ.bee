import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './session.entity';
import { QRToken } from './qr-token.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    @InjectRepository(QRToken)
    private readonly qrTokenRepo: Repository<QRToken>,
  ) {}

  async create(classId: string, date: Date, startTime?: string, endTime?: string) {
    const session = this.sessionRepo.create({ classId, date, startTime, endTime });
    return this.sessionRepo.save(session);
  }

  async findByClass(classId: string) {
    return this.sessionRepo.find({ where: { classId }, order: { date: 'DESC' } });
  }

  async generateQRToken(sessionId: string) {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 1000); // 60s validity
    
    const existing = await this.qrTokenRepo.findOne({ where: { sessionId } });
    if (existing) {
      existing.token = token;
      existing.expiresAt = expiresAt;
      existing.rotatedAt = new Date();
      return this.qrTokenRepo.save(existing);
    }
    
    const qr = this.qrTokenRepo.create({ sessionId, token, expiresAt });
    return this.qrTokenRepo.save(qr);
  }

  async verifyQRToken(token: string) {
    const qr = await this.qrTokenRepo.findOne({ where: { token } });
    if (!qr || qr.expiresAt < new Date()) return null;
    return qr.sessionId;
  }
}
