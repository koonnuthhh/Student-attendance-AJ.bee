import { Controller, Post, Get, Body, Param, UseGuards, Req, Delete, NotFoundException, ConflictException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClassesService } from './classes.service';
import { StudentsService } from '../students/students.service';

@Controller('classes')
@UseGuards(AuthGuard('jwt'))
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
    private readonly studentsService: StudentsService,
  ) {}

  @Post()
  async create(@Req() req, @Body('name') name: string, @Body('subject') subject?: string) {
    return this.classesService.create(req.user.userId, name, subject);
  }

  @Get()
  async findAll(@Req() req) {
    return this.classesService.findByTeacher(req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  @Get(':id/students')
  async getStudents(@Param('id') classId: string) {
    return this.studentsService.findByClass(classId);
  }

  @Post(':id/students')
  async addStudentToClass(
    @Param('id') classId: string,
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
    @Body('studentId') studentId: string,
    @Body('email') email?: string,
  ) {
    // Create student record
    const student = await this.studentsService.create({
      firstName,
      lastName,
      studentId,
      email,
    });

    // Enroll student in class
    await this.studentsService.enroll(classId, student.id);
    
    return student;
  }

  @Post(':id/students/enroll')
  async enrollExistingStudent(
    @Param('id') classId: string,
    @Body('studentId') studentId: string,
  ) {
    // Find student by studentId
    const student = await this.studentsService.findByStudentId(studentId);
    
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Check if student is already enrolled
    const isEnrolled = await this.studentsService.isEnrolledInClass(classId, student.id);
    if (isEnrolled) {
      throw new ConflictException(`Student ${studentId} is already enrolled in this class`);
    }

    // Enroll student in class
    await this.studentsService.enroll(classId, student.id);
    
    return {
      message: 'Student enrolled successfully',
      student: {
        id: student.id,
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
      }
    };
  }

  @Delete(':classId/students/:studentId')
  async removeStudentFromClass(
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
  ) {
    await this.studentsService.unenroll(classId, studentId);
    return { message: 'Student removed from class successfully' };
  }
}
