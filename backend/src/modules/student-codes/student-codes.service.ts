import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Class } from '../classes/class.entity';
import { Student } from '../students/student.entity';
import { Enrollment, EnrollmentStatus } from '../students/enrollment.entity';

@Injectable()
export class StudentCodesService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Class)
    private readonly classRepo: Repository<Class>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
  ) {}

  /**
   * Generate a unique 5-digit student code
   */
  private generateCode(): string {
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return code;
  }

  /**
   * Generate a unique student code that doesn't exist in the database
   */
  async generateUniqueCode(): Promise<string> {
    let code: string;
    let exists = true;
    let attempts = 0;
    const maxAttempts = 10;

    while (exists && attempts < maxAttempts) {
      code = this.generateCode();
      const existingUser = await this.userRepo.findOne({ 
        where: { studentCode: code } 
      });
      exists = !!existingUser;
      attempts++;
    }

    if (exists) {
      throw new BadRequestException('Unable to generate unique student code. Please try again.');
    }

    return code!;
  }

  /**
   * Validate if a student code exists and is available for use
   */
  async validateCode(code: string): Promise<{
    isValid: boolean;
    isUsed: boolean;
    user?: User;
  }> {
    if (!code || code.length !== 5) {
      return { isValid: false, isUsed: false };
    }

    const user = await this.userRepo.findOne({ 
      where: { studentCode: code.toUpperCase() },
      relations: ['roles']
    });

    if (!user) {
      return { isValid: false, isUsed: false };
    }

    return {
      isValid: true,
      isUsed: user.studentCodeUsed,
      user
    };
  }

  /**
   * Mark a student code as used
   */
  async markCodeAsUsed(code: string): Promise<void> {
    await this.userRepo.update(
      { studentCode: code.toUpperCase() },
      { 
        studentCodeUsed: true,
        studentCodeGeneratedAt: new Date()
      }
    );
  }

  /**
   * Create a new student code for a specific class
   */
  async createStudentCodeForClass(classId: string): Promise<string> {
    // Verify class exists
    const classEntity = await this.classRepo.findOne({ where: { id: classId } });
    if (!classEntity) {
      throw new BadRequestException('Class not found');
    }

    const code = await this.generateUniqueCode();
    
    // Create a placeholder user with the student code
    const placeholderUser = this.userRepo.create({
      email: `temp_${code.toLowerCase()}@student.placeholder`, // Temp email
      name: `Student ${code}`, // Temp name
      passwordHash: 'placeholder', // Will be updated during registration
      studentCode: code,
      studentCodeGeneratedAt: new Date(),
      studentCodeUsed: false,
    });

    await this.userRepo.save(placeholderUser);

    // Create student record linked to this code
    const student = this.studentRepo.create({
      firstName: 'Student',
      lastName: code,
      studentId: code,
      email: placeholderUser.email,
    });

    const savedStudent = await this.studentRepo.save(student);

    // Create enrollment for this student in the class
    const enrollment = this.enrollmentRepo.create({
      classId: classId,
      studentId: savedStudent.id,
      status: EnrollmentStatus.ACTIVE,
    });

    await this.enrollmentRepo.save(enrollment);

    return code;
  }

  /**
   * Use a student code during registration - link the real user to the placeholder
   */
  async useStudentCode(code: string, realUser: User): Promise<void> {
    const placeholderUser = await this.userRepo.findOne({ 
      where: { studentCode: code.toUpperCase() } 
    });

    if (!placeholderUser) {
      throw new BadRequestException('Invalid student code');
    }

    if (placeholderUser.studentCodeUsed) {
      throw new BadRequestException('Student code already used');
    }

    // Update the real user with the student code
    realUser.studentCode = code.toUpperCase();
    realUser.studentCodeUsed = true;
    realUser.studentCodeGeneratedAt = placeholderUser.studentCodeGeneratedAt;
    await this.userRepo.save(realUser);

    // Find the student record and update it with real user info
    const student = await this.studentRepo.findOne({
      where: { studentId: code.toUpperCase() }
    });

    if (student) {
      // Parse real user's name
      const nameParts = realUser.name.trim().split(' ');
      student.firstName = nameParts[0] || 'Student';
      student.lastName = nameParts.slice(1).join(' ') || '';
      student.email = realUser.email;
      await this.studentRepo.save(student);
    }

    // Delete placeholder user
    await this.userRepo.remove(placeholderUser);
  }

  /**
   * Get all unused student codes
   */
  async getUnusedCodes(): Promise<User[]> {
    return this.userRepo.find({
      where: { 
        studentCodeUsed: false,
        studentCode: { length: 5 } as any
      },
      select: ['id', 'studentCode', 'studentCodeGeneratedAt'],
      order: { studentCodeGeneratedAt: 'DESC' }
    });
  }

  /**
   * Check if a student code is expired (30 days)
   */
  isCodeExpired(generatedAt: Date): boolean {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return generatedAt < thirtyDaysAgo;
  }

  /**
   * Clean up expired unused codes
   */
  async cleanupExpiredCodes(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find expired placeholder users
    const expiredUsers = await this.userRepo.find({
      where: {
        studentCodeUsed: false,
        email: `%@student.placeholder` as any, // Pattern match for temp emails
      }
    });

    let deletedCount = 0;

    for (const user of expiredUsers) {
      if (user.studentCodeGeneratedAt && this.isCodeExpired(user.studentCodeGeneratedAt)) {
        // Find and delete associated student record
        const student = await this.studentRepo.findOne({
          where: { studentId: user.studentCode }
        });
        
        if (student) {
          // Delete enrollments first (foreign key constraint)
          await this.enrollmentRepo.delete({ studentId: student.id });
          // Delete student record
          await this.studentRepo.remove(student);
        }

        // Delete placeholder user
        await this.userRepo.remove(user);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Get classes associated with a student code
   */
  async getClassesForCode(code: string): Promise<Class[]> {
    const student = await this.studentRepo.findOne({
      where: { studentId: code.toUpperCase() }
    });

    if (!student) {
      return [];
    }

    const enrollments = await this.enrollmentRepo.find({
      where: { studentId: student.id },
      relations: ['class', 'class.teacher']
    });

    return enrollments.map(enrollment => enrollment.class);
  }
}