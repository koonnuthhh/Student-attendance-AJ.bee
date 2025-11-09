import { Controller, Get, UseGuards, Req, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentsService } from './students.service';
import { User } from '../users/user.entity';
import { Session } from '../sessions/session.entity';
import { AttendanceRecord, AttendanceStatus } from '../attendance/attendance-record.entity';

@Controller('students')
@UseGuards(AuthGuard('jwt'))
export class StudentsStudentController {
  constructor(
    private readonly studentsService: StudentsService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRepo: Repository<AttendanceRecord>,
  ) {}

  @Get('my-classes')
  async getMyClasses(@Req() req) {
    // JWT payload has user ID - check both 'sub' and 'userId' for compatibility
    const userId = req.user.sub || req.user.userId;
    
    console.error('🚨🚨🚨 MY-CLASSES ENDPOINT HIT 🚨🚨🚨');
    console.error('=== GET MY-CLASSES DEBUG ===');
    console.error('Getting classes for user:', userId);
    console.error('Request headers:', req.headers.authorization ? 'Has token' : 'No token');
    console.error('Full user object from JWT:', req.user);
    console.error('Timestamp:', new Date().toISOString());
    
    // Fetch the full user record to get studentCode
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      console.log('User not found:', userId);
      return [];
    }
    
    console.log('User found:', { 
      id: user.id, 
      email: user.email,
      studentCode: user.studentCode,
      hasStudentCode: !!user.studentCode 
    });

    // Check if user has a student code
    if (!user.studentCode) {
      console.log('User has no student code - returning empty array');
      console.log('=== END DEBUG - NO STUDENT CODE ===');
      return [];
    }

    console.log('Looking for student with studentCode:', user.studentCode);

    // Find student record by the user's studentCode
    const student = await this.studentsService.findByStudentId(user.studentCode);
    if (!student) {
      console.log('Student record not found for studentCode:', user.studentCode);
      return [];
    }
    
    console.log('Student found:', { id: student.id, studentId: student.studentId });

    // Get enrollments with class and teacher information
    const enrollments = await this.studentsService.findClassesByStudentId(student.id);
    
    console.log('Enrollments found:', enrollments.length);
    
    // Transform the data to match frontend expectations with real data
    const result = await Promise.all(enrollments.map(async (enrollment) => {
      const classId = enrollment.class.id;
      
      // Get all sessions for this class
      const allSessions = await this.sessionRepo.find({
        where: { classId },
        order: { date: 'DESC' }
      });
      
      // Get sessions for today
      const today = new Date().toISOString().split('T')[0];
      const todaySessions = allSessions.filter(session => {
        // Convert date to string format YYYY-MM-DD
        let sessionDateStr: string;
        if (session.date instanceof Date) {
          sessionDateStr = session.date.toISOString().split('T')[0];
        } else {
          // If it's already a string, extract just the date part
          sessionDateStr = String(session.date).split('T')[0];
        }
        return sessionDateStr === today;
      });
      
      // Get attendance records for this student in this class
      const attendanceRecords = await this.attendanceRepo.find({
        where: { 
          studentId: student.id,
          session: { classId }
        },
        relations: ['session']
      });
      
      // Calculate attendance rate
      let attendanceRate = 0;
      if (allSessions.length > 0) {
        const presentCount = attendanceRecords.filter(record => 
          record.status === AttendanceStatus.PRESENT
        ).length;
        attendanceRate = Math.round((presentCount / allSessions.length) * 100);
      }
      
      return {
        id: enrollment.class.id,
        name: enrollment.class.name,
        subject: enrollment.class.subject || 'No subject specified',
        teacher: {
          name: enrollment.class.teacher.name,
          email: enrollment.class.teacher.email,
        },
        enrollmentStatus: enrollment.status,
        sessionsToday: todaySessions.length,
        attendanceRate: attendanceRate,
        totalSessions: allSessions.length,
        attendedSessions: attendanceRecords.filter(r => r.status === AttendanceStatus.PRESENT).length,
      };
    }));
    
    console.log('Returning classes:', result);
    return result;
  }

  @Get('attendance/class/:classId')
  async getMyAttendanceForClass(@Param('classId') classId: string, @Req() req) {
    const userId = req.user.sub || req.user.userId;
    
    console.log('Getting attendance for user:', userId, 'class:', classId);
    
    // Fetch the full user record to get studentCode
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.studentCode) {
      console.log('User not found or no student code');
      return [];
    }

    // Find student record
    const student = await this.studentsService.findByStudentId(user.studentCode);
    if (!student) {
      console.log('Student record not found');
      return [];
    }

    // Get attendance records for this student in this specific class
    const attendanceRecords = await this.attendanceRepo.find({
      where: { 
        studentId: student.id,
        session: { classId }
      },
      relations: ['session'],
      order: { session: { date: 'DESC' } }
    });

    console.log('Attendance records found:', attendanceRecords.length);
    
    // Transform the data to match frontend expectations
    const result = attendanceRecords.map(record => ({
      id: record.id,
      status: record.status.toLowerCase(), // Convert enum to lowercase for frontend
      checkInTime: record.markedAt,
      notes: record.note,
      session: {
        id: record.session.id,
        date: record.session.date,
        startTime: record.session.startTime,
        endTime: record.session.endTime,
      }
    }));
    
    console.log('Returning attendance records:', result);
    return result;
  }
}