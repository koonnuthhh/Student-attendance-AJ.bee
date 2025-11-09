import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentCodesController } from './student-codes.controller';
import { StudentCodesService } from './student-codes.service';
import { User } from '../users/user.entity';
import { Class } from '../classes/class.entity';
import { Student } from '../students/student.entity';
import { Enrollment } from '../students/enrollment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Class, Student, Enrollment])],
  controllers: [StudentCodesController],
  providers: [StudentCodesService],
  exports: [StudentCodesService],
})
export class StudentCodesModule {}