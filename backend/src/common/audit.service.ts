import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '@/common/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async log(
    entity: string,
    entityId: string,
    action: string,
    changedBy: string,
    changes: Record<string, any>,
  ): Promise<AuditLog> {
    const auditLog = this.auditRepo.create({
      entity,
      entityId,
      action,
      changedBy,
      changes,
    });
    
    return this.auditRepo.save(auditLog);
  }

  async findByEntity(entity: string, entityId: string): Promise<AuditLog[]> {
    return this.auditRepo.find({
      where: { entity, entityId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<AuditLog[]> {
    return this.auditRepo.find({
      where: { changedBy: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(limit: number = 100, offset: number = 0): Promise<[AuditLog[], number]> {
    return this.auditRepo.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }
}
