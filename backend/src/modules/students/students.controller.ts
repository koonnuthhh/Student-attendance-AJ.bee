import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StudentsService } from './students.service';

@Controller('classes/:classId/students')
@UseGuards(AuthGuard('jwt'))
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  async addStudent(
    @Param('classId') classId: string,
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
    @Body('studentId') studentId: string,
    @Body('email') email?: string,
  ) {
    const student = await this.studentsService.create({ firstName, lastName, studentId, email });
    await this.studentsService.enroll(classId, student.id);
    return student;
  }

  @Get()
  async getStudents(@Param('classId') classId: string) {
    return this.studentsService.findByClass(classId);
  }

  @Delete(':studentId')
  async removeStudent(
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
  ) {
    await this.studentsService.unenroll(classId, studentId);
    return { message: 'Student removed from class successfully' };
  }
}
