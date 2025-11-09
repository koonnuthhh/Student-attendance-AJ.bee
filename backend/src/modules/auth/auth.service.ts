import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { User, UserStatus } from '../users/user.entity';
import { VerificationToken, TokenType } from '../users/verification-token.entity';
import { Role, RoleName } from '../users/role.entity';
import { Student } from '../students/student.entity';
import { EmailService } from '../notifications/email.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(VerificationToken)
    private readonly tokenRepo: Repository<VerificationToken>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async register(email: string, name: string, password: string, roleName: RoleName = RoleName.STUDENT, studentId?: string) {
    console.log('AuthService.register called with:', { email, name: !!name, password: !!password, roleName, studentId });

    try {
      // Check if user already exists
      const existingUser = await this.userRepo.findOne({ where: { email } });
      if (existingUser) {
        console.error('User already exists:', email);
        throw new BadRequestException('User with this email already exists');
      }

      // Basic validation
      if (!email || !name || !password) {
        throw new BadRequestException('Missing required fields: email, name, password');
      }

      // For students, require a student ID
      if (roleName === RoleName.STUDENT && (!studentId || !studentId.trim())) {
        throw new BadRequestException('Student ID is required for student accounts');
      }

      // Validate student ID length if provided
      if (studentId && (studentId.trim().length < 3 || studentId.trim().length > 20)) {
        throw new BadRequestException('Student ID must be between 3-20 characters');
      }

      // Check if student ID is already used (for students only)
      if (roleName === RoleName.STUDENT && studentId) {
        const existingStudent = await this.studentRepo.findOne({ 
          where: { studentId: studentId.trim() } 
        });
        if (existingStudent) {
          throw new BadRequestException('This Student ID is already registered');
        }
      }

      console.log('Hashing password...');
      const passwordHash = await argon2.hash(password);
      
      console.log('Creating user record...');
      const user = this.userRepo.create({
        email,
        name,
        passwordHash,
        status: UserStatus.ACTIVE, // Skip email verification for now
        studentCode: studentId?.trim(), // Store the student ID in studentCode field for now
      });
      
      console.log('Finding role:', roleName);
      const role = await this.roleRepo.findOne({ where: { name: roleName } });
      if (role) {
        user.roles = [role];
      } else {
        console.warn('Role not found, trying to find Student role');
        // Try to find Student role as fallback
        const studentRole = await this.roleRepo.findOne({ where: { name: RoleName.STUDENT } });
        if (studentRole) {
          user.roles = [studentRole];
        }
      }
      
      console.log('Saving user...');
      const savedUser = await this.userRepo.save(user);
      console.log('User saved with ID:', savedUser.id);

      // Create student record if this is a student
      if (roleName === RoleName.STUDENT && studentId) {
        try {
          console.log('Creating student record with ID:', studentId.trim());
          // Parse name into first and last name
          const nameParts = name.trim().split(' ');
          const firstName = nameParts[0] || 'Student';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          const studentRecord = this.studentRepo.create({
            firstName,
            lastName,
            studentId: studentId.trim(),
            email,
          });
          
          await this.studentRepo.save(studentRecord);
          console.log('Student record created successfully');
        } catch (error) {
          console.error('Failed to create student record:', error);
          // Don't fail registration if student record creation fails
        }
      }
      
      console.log('Registration completed successfully');
      return { user: savedUser, message: 'Registration successful' };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email }, relations: ['roles'] });
    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const payload = { sub: user.id, email: user.email, roles: user.roles.map((r) => r.name) };
    const accessToken = this.jwtService.sign(payload);
    
    return { accessToken, user };
  }

  async verifyEmail(token: string) {
    const verif = await this.tokenRepo.findOne({
      where: { token, type: TokenType.EMAIL_VERIFICATION, usedAt: null },
    });
    
    if (!verif || verif.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    
    await this.userRepo.update(verif.userId, {
      emailVerifiedAt: new Date(),
      status: UserStatus.ACTIVE,
    });
    
    verif.usedAt = new Date();
    await this.tokenRepo.save(verif);
    
    return { success: true };
  }

  async requestPasswordReset(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return { success: true }; // Don't reveal if user exists
    
    const token = uuidv4();
    await this.tokenRepo.save({
      userId: user.id,
      type: TokenType.PASSWORD_RESET,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1h
    });
    
    // Send password reset email
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
    const resetUrl = `${appUrl}/reset-password?token=${token}`;
    
    try {
      const emailTemplate = this.emailService.generatePasswordResetEmail(user.name, resetUrl);
      await this.emailService.sendEmail(email, emailTemplate);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Don't fail the request if email fails
    }
    
    return { success: true, resetToken: token };
  }

  async resetPassword(token: string, newPassword: string) {
    const verif = await this.tokenRepo.findOne({
      where: { token, type: TokenType.PASSWORD_RESET, usedAt: null },
    });
    
    if (!verif || verif.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    
    const passwordHash = await argon2.hash(newPassword);
    await this.userRepo.update(verif.userId, { passwordHash });
    
    verif.usedAt = new Date();
    await this.tokenRepo.save(verif);
    
    return { success: true };
  }
}
