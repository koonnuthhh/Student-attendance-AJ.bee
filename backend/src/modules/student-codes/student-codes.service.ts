import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Class } from '../classes/class.entity';

@Injectable()
export class StudentCodesService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Class)
    private readonly classRepo: Repository<Class>,
  ) {}

  /**
   * Generate a unique 8-character student code
   */
  private generateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
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
    if (!code || code.length !== 8) {
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
   * Create a new student code entry (for pre-registration by teachers)
   */
  async createStudentCode(): Promise<string> {
    const code = await this.generateUniqueCode();
    
    // Create a placeholder user with just the student code
    const user = this.userRepo.create({
      email: `temp_${code}@placeholder.com`, // Temporary email
      name: `Student ${code}`, // Temporary name
      passwordHash: 'placeholder', // Will be updated during registration
      studentCode: code,
      studentCodeGeneratedAt: new Date(),
      studentCodeUsed: false,
    });

    await this.userRepo.save(user);
    return code;
  }

  /**
   * Get all unused student codes
   */
  async getUnusedCodes(): Promise<User[]> {
    return this.userRepo.find({
      where: { 
        studentCodeUsed: false,
        studentCode: { length: 8 } as any
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

    const result = await this.userRepo.delete({
      studentCodeUsed: false,
      studentCodeGeneratedAt: { $lt: thirtyDaysAgo } as any,
      email: { $like: 'temp_%@placeholder.com' } as any
    });

    return result.affected || 0;
  }
}