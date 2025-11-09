import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './student.entity';
import { Enrollment } from './enrollment.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
  ) {}

  async create(data: Partial<Student>) {
    const student = this.studentRepo.create(data);
    return this.studentRepo.save(student);
  }

  async enroll(classId: string, studentId: string) {
    const enrollment = this.enrollmentRepo.create({ classId, studentId });
    return this.enrollmentRepo.save(enrollment);
  }

  async unenroll(classId: string, studentId: string) {
    return this.enrollmentRepo.delete({ classId, studentId });
  }

  async findByClass(classId: string) {
    return this.enrollmentRepo.find({
      where: { classId },
      relations: ['student'],
    });
  }

  async findByStudentId(studentId: string): Promise<Student | null> {
    return this.studentRepo.findOne({
      where: { studentId }
    });
  }

  async isEnrolledInClass(classId: string, studentId: string): Promise<boolean> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { classId, studentId }
    });
    return !!enrollment;
  }

  async findClassesByStudentId(studentId: string) {
    return this.enrollmentRepo.find({
      where: { studentId },
      relations: ['class', 'class.teacher'],
    });
  }
}
