import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { AttendanceRecord, AttendanceStatus } from '../attendance/attendance-record.entity';
import { createObjectCsvWriter } from 'csv-writer';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';

export interface ExportFilters {
  classId?: string;
  sessionId?: string;
  studentId?: string;
  status?: AttendanceStatus | AttendanceStatus[];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

@Injectable()
export class ExportsService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRepo: Repository<AttendanceRecord>,
  ) {
    // Ensure tmp directory exists
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
  }

  private buildWhereClause(filters: ExportFilters) {
    const where: any = {};
    
    if (filters.sessionId) {
      where.sessionId = filters.sessionId;
    }
    
    if (filters.studentId) {
      where.studentId = filters.studentId;
    }
    
    if (filters.status) {
      where.status = Array.isArray(filters.status) ? In(filters.status) : filters.status;
    }
    
    if (filters.startDate && filters.endDate) {
      where.markedAt = Between(filters.startDate, filters.endDate);
    } else if (filters.startDate) {
      where.markedAt = Between(filters.startDate, new Date());
    }
    
    return where;
  }

  async exportCSV(filters: ExportFilters = {}) {
    const where = this.buildWhereClause(filters);
    
    const queryBuilder = this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.student', 'student')
      .leftJoinAndSelect('attendance.session', 'session')
      .leftJoinAndSelect('session.class', 'class');
    
    // Apply filters
    if (Object.keys(where).length > 0) {
      Object.keys(where).forEach((key) => {
        if (key === 'markedAt' && where[key]) {
          // Handle Between clause
          queryBuilder.andWhere(`attendance.${key} >= :startDate AND attendance.${key} <= :endDate`, {
            startDate: filters.startDate,
            endDate: filters.endDate,
          });
        } else if (key === 'status' && Array.isArray(where[key])) {
          queryBuilder.andWhere(`attendance.${key} IN (:...statuses)`, { statuses: where[key] });
        } else {
          queryBuilder.andWhere(`attendance.${key} = :${key}`, { [key]: where[key] });
        }
      });
    }
    
    // Apply class filter if provided
    if (filters.classId) {
      queryBuilder.andWhere('session.classId = :classId', { classId: filters.classId });
    }
    
    // Apply limit
    if (filters.limit) {
      queryBuilder.take(filters.limit);
    }
    
    queryBuilder.orderBy('attendance.markedAt', 'DESC');
    
    const records = await queryBuilder.getMany();
    
    const filePath = path.join(process.cwd(), 'tmp', `attendance_${Date.now()}.csv`);
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'sessionId', title: 'Session ID' },
        { id: 'className', title: 'Class' },
        { id: 'sessionDate', title: 'Session Date' },
        { id: 'studentId', title: 'Student ID' },
        { id: 'studentName', title: 'Student Name' },
        { id: 'status', title: 'Status' },
        { id: 'source', title: 'Source' },
        { id: 'markedBy', title: 'Marked By' },
        { id: 'markedAt', title: 'Marked At' },
        { id: 'note', title: 'Note' },
      ],
    });
    
    const data = records.map((r) => ({
      sessionId: r.sessionId,
      className: r.session?.class?.name || 'N/A',
      sessionDate: r.session?.date?.toISOString().split('T')[0] || 'N/A',
      studentId: r.student?.studentId || 'N/A',
      studentName: `${r.student?.firstName || ''} ${r.student?.lastName || ''}`.trim(),
      status: r.status,
      source: r.source,
      markedBy: r.markedBy,
      markedAt: r.markedAt.toISOString(),
      note: r.note || '',
    }));
    
    await csvWriter.writeRecords(data);
    return { filePath, recordCount: data.length };
  }

  async exportXLSX(filters: ExportFilters = {}) {
    const where = this.buildWhereClause(filters);
    
    const queryBuilder = this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.student', 'student')
      .leftJoinAndSelect('attendance.session', 'session')
      .leftJoinAndSelect('session.class', 'class');
    
    // Apply filters (same logic as CSV)
    if (Object.keys(where).length > 0) {
      Object.keys(where).forEach((key) => {
        if (key === 'markedAt' && where[key]) {
          queryBuilder.andWhere(`attendance.${key} >= :startDate AND attendance.${key} <= :endDate`, {
            startDate: filters.startDate,
            endDate: filters.endDate,
          });
        } else if (key === 'status' && Array.isArray(where[key])) {
          queryBuilder.andWhere(`attendance.${key} IN (:...statuses)`, { statuses: where[key] });
        } else {
          queryBuilder.andWhere(`attendance.${key} = :${key}`, { [key]: where[key] });
        }
      });
    }
    
    if (filters.classId) {
      queryBuilder.andWhere('session.classId = :classId', { classId: filters.classId });
    }
    
    if (filters.limit) {
      queryBuilder.take(filters.limit);
    }
    
    queryBuilder.orderBy('attendance.markedAt', 'DESC');
    
    const records = await queryBuilder.getMany();
    
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance');
    
    // Style the header
    sheet.columns = [
      { header: 'Session ID', key: 'sessionId', width: 38 },
      { header: 'Class', key: 'className', width: 20 },
      { header: 'Session Date', key: 'sessionDate', width: 15 },
      { header: 'Student ID', key: 'studentId', width: 15 },
      { header: 'Student Name', key: 'studentName', width: 25 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Source', key: 'source', width: 12 },
      { header: 'Marked By', key: 'markedBy', width: 38 },
      { header: 'Marked At', key: 'markedAt', width: 20 },
      { header: 'Note', key: 'note', width: 30 },
    ];
    
    // Style header row
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
    
    records.forEach((r) => {
      sheet.addRow({
        sessionId: r.sessionId,
        className: r.session?.class?.name || 'N/A',
        sessionDate: r.session?.date?.toISOString().split('T')[0] || 'N/A',
        studentId: r.student?.studentId || 'N/A',
        studentName: `${r.student?.firstName || ''} ${r.student?.lastName || ''}`.trim(),
        status: r.status,
        source: r.source,
        markedBy: r.markedBy,
        markedAt: r.markedAt.toISOString(),
        note: r.note || '',
      });
    });
    
    const filePath = path.join(process.cwd(), 'tmp', `attendance_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(filePath);
    return { filePath, recordCount: records.length };
  }
}

