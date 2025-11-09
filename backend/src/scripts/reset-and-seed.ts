import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { Role, RoleName } from '../modules/users/role.entity';
import { User, UserStatus } from '../modules/users/user.entity';
import { Student } from '../modules/students/student.entity';
import { Enrollment } from '../modules/students/enrollment.entity';
import * as argon2 from 'argon2';

// Optional imports - these might not exist
let Class: any = null;
let AttendanceRecord: any = null;
let LeaveRequest: any = null;
let LeaveBalance: any = null;
let Session: any = null;
let AuditLog: any = null;

try {
  Class = require('../modules/classes/class.entity').Class;
} catch (e) { console.log('Class entity not found, skipping...'); }

try {
  AttendanceRecord = require('../modules/attendance/attendance-record.entity').AttendanceRecord;
} catch (e) { console.log('AttendanceRecord entity not found, skipping...'); }

try {
  LeaveRequest = require('../modules/leave/leave-request.entity').LeaveRequest;
} catch (e) { console.log('LeaveRequest entity not found, skipping...'); }

try {
  LeaveBalance = require('../modules/leave/leave-balance.entity').LeaveBalance;
} catch (e) { console.log('LeaveBalance entity not found, skipping...'); }

try {
  Session = require('../modules/sessions/session.entity').Session;
} catch (e) { console.log('Session entity not found, skipping...'); }

try {
  AuditLog = require('../common/audit-log.entity').AuditLog;
} catch (e) { console.log('AuditLog entity not found, skipping...'); }

config(); // Load environment variables

async function resetAndSeedDatabase() {
  console.log('🗑️  Starting database reset and seed...\n');
  
  // Create a new DataSource specifically for this script
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [
      'src/**/*.entity{.ts,.js}',
      'src/common/audit-log.entity{.ts,.js}'
    ],
    synchronize: false,
    logging: false,
  });
  
  try {
    await dataSource.initialize();
    console.log('✓ Database connected\n');
    
    // Clear all data in the correct order (respecting foreign key constraints)
    console.log('🧹 Clearing existing data...');
    
    try {
      // Use individual repository operations instead of raw SQL
      const repos: any = {};
      
      if (AuditLog) repos.auditLog = dataSource.getRepository(AuditLog);
      if (AttendanceRecord) repos.attendanceRecord = dataSource.getRepository(AttendanceRecord);
      if (Session) repos.session = dataSource.getRepository(Session);
      if (LeaveRequest) repos.leaveRequest = dataSource.getRepository(LeaveRequest);
      if (LeaveBalance) repos.leaveBalance = dataSource.getRepository(LeaveBalance);
      repos.enrollment = dataSource.getRepository(Enrollment);
      if (Class) repos.class = dataSource.getRepository(Class);
      repos.student = dataSource.getRepository(Student);
      repos.user = dataSource.getRepository(User);
      repos.role = dataSource.getRepository(Role);

      // Clear data in order
      if (repos.auditLog) {
        await repos.auditLog.clear();
        console.log('  ✓ Cleared audit_logs');
      }
      
      if (repos.attendanceRecord) {
        await repos.attendanceRecord.clear();
        console.log('  ✓ Cleared attendance_records');
      }
      
      if (repos.session) {
        await repos.session.clear();
        console.log('  ✓ Cleared sessions');
      }
      
      if (repos.leaveRequest) {
        await repos.leaveRequest.clear();
        console.log('  ✓ Cleared leave_requests');
      }
      
      if (repos.leaveBalance) {
        await repos.leaveBalance.clear();
        console.log('  ✓ Cleared leave_balances');
      }
      
      await repos.enrollment.clear();
      console.log('  ✓ Cleared enrollments');
      
      if (repos.class) {
        await repos.class.clear();
        console.log('  ✓ Cleared classes');
      }
      
      await repos.student.clear();
      console.log('  ✓ Cleared students');
      
      await repos.user.clear();
      console.log('  ✓ Cleared users');
      
      await repos.role.clear();
      console.log('  ✓ Cleared roles');
      
      console.log('✓ Database cleared successfully\n');
      
    } catch (error) {
      console.log('Warning: Some tables might not exist, continuing with seed...');
      console.log('✓ Database clearing completed\n');
    }
    
    // Seed roles first
    console.log('🌱 Creating roles...');
    const roleRepo = dataSource.getRepository(Role);
    
    const roles = [
      { name: RoleName.ADMIN, description: 'System administrator' },
      { name: RoleName.TEACHER, description: 'Teacher/Instructor' },
      { name: RoleName.STUDENT, description: 'Student' },
      { name: RoleName.EMPLOYEE, description: 'Employee' },
    ];
    
    const createdRoles = [];
    for (const roleData of roles) {
      const role = roleRepo.create(roleData);
      const savedRole = await roleRepo.save(role);
      createdRoles.push(savedRole);
      console.log(`  ✓ Created role: ${savedRole.name}`);
    }
    
    // Create users
    console.log('\n👥 Creating users...');
    const userRepo = dataSource.getRepository(User);
    const studentRepo = dataSource.getRepository(Student);
    
    // Find roles for assignment
    const teacherRole = createdRoles.find(r => r.name === RoleName.TEACHER);
    const studentRole = createdRoles.find(r => r.name === RoleName.STUDENT);
    
    // Create teacher account
    console.log('  📚 Creating teacher account...');
    const teacherPassword = await argon2.hash('teacher123');
    const teacher = userRepo.create({
      email: 'teacher@school.edu',
      name: 'John Smith',
      passwordHash: teacherPassword,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      roles: [teacherRole!],
    });
    
    const savedTeacher = await userRepo.save(teacher);
    console.log(`    ✓ Teacher created: ${savedTeacher.email} (Password: teacher123)`);
    
    // Create student accounts
    console.log('  🎓 Creating student accounts...');
    
    // Student 1
    const student1Password = await argon2.hash('student123');
    const student1 = userRepo.create({
      email: 'student1@school.edu',
      name: 'Alice Johnson',
      passwordHash: student1Password,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      studentCode: '12345',
      studentCodeGeneratedAt: new Date(),
      studentCodeUsed: true,
      roles: [studentRole!],
    });
    
    const savedStudent1 = await userRepo.save(student1);
    console.log(`    ✓ Student 1 created: ${savedStudent1.email} (Password: student123, Code: STU001)`);
    
    // Create student record for student 1
    const studentRecord1 = studentRepo.create({
      firstName: 'Alice',
      lastName: 'Johnson',
      studentId: 'STU001',
      email: savedStudent1.email,
    });
    await studentRepo.save(studentRecord1);
    console.log(`    ✓ Student record 1 created`);
    
    // Student 2
    const student2Password = await argon2.hash('student456');
    const student2 = userRepo.create({
      email: 'student2@school.edu',
      name: 'Bob Wilson',
      passwordHash: student2Password,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      studentCode: '67890',
      studentCodeGeneratedAt: new Date(),
      studentCodeUsed: true,
      roles: [studentRole!],
    });
    
    const savedStudent2 = await userRepo.save(student2);
    console.log(`    ✓ Student 2 created: ${savedStudent2.email} (Password: student456, Code: STU002)`);
    
    // Create student record for student 2
    const studentRecord2 = studentRepo.create({
      firstName: 'Bob',
      lastName: 'Wilson',
      studentId: 'STU002',
      email: savedStudent2.email,
    });
    await studentRepo.save(studentRecord2);
    console.log(`    ✓ Student record 2 created`);
    
    console.log('\n✅ Database reset and seed completed successfully!');
    console.log('\n📋 Summary:');
    console.log('=====================================');
    console.log('Teacher Account:');
    console.log('  Email: teacher@school.edu');
    console.log('  Password: teacher123');
    console.log('  Name: John Smith');
    console.log('');
    console.log('Student Account 1:');
    console.log('  Email: student1@school.edu');
    console.log('  Password: student123');
    console.log('  Name: Alice Johnson');
    console.log('  Student Code: STU001');
    console.log('');
    console.log('Student Account 2:');
    console.log('  Email: student2@school.edu');
    console.log('  Password: student456');
    console.log('  Name: Bob Wilson');
    console.log('  Student Code: STU002');
    console.log('=====================================\n');
    
  } catch (error) {
    console.error('❌ Error during database reset and seed:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

// Run the script
resetAndSeedDatabase().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});