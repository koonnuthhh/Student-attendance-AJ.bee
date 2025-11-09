import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { Enrollment } from './enrollment.entity';
import { User } from '../users/user.entity';
import { Session } from '../sessions/session.entity';
import { AttendanceRecord } from '../attendance/attendance-record.entity';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { StudentsStudentController } from './students-student.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Enrollment, User, Session, AttendanceRecord])],
  providers: [StudentsService],
  controllers: [StudentsController, StudentsStudentController],
  exports: [StudentsService],
})
export class StudentsModule {}
