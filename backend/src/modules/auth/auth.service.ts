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
import { StudentCodesService } from '../student-codes/student-codes.service';
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
    private readonly studentCodesService: StudentCodesService,
  ) {}

  async register(email: string, name: string, password: string, roleName: RoleName = RoleName.STUDENT, studentCode?: string) {
    // If student code is provided, validate it
    if (studentCode) {
      const codeValidation = await this.studentCodesService.validateCode(studentCode);
      if (!codeValidation.isValid) {
        throw new BadRequestException('Invalid student code');
      }
      if (codeValidation.isUsed) {
        throw new BadRequestException('Student code has already been used');
      }
    }

    const passwordHash = await argon2.hash(password);
    const user = this.userRepo.create({
      email,
      name,
      passwordHash,
      status: UserStatus.PENDING_VERIFICATION,
      studentCode: studentCode?.toUpperCase(),
      studentCodeUsed: !!studentCode,
      studentCodeGeneratedAt: studentCode ? new Date() : undefined,
    });
    
    const role = await this.roleRepo.findOne({ where: { name: roleName } });
    if (role) user.roles = [role];
    
    await this.userRepo.save(user);

    // If this is a student registration and has a student code, create a student record
    if (roleName === RoleName.STUDENT && studentCode) {
      // Parse name into first and last name
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || 'Student';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const studentRecord = this.studentRepo.create({
        firstName,
        lastName,
        studentId: studentCode.toUpperCase(),
        email,
      });
      
      await this.studentRepo.save(studentRecord);
    }

    // Mark student code as used if provided
    if (studentCode) {
      await this.studentCodesService.markCodeAsUsed(studentCode);
    }
    
    // Generate verification token
    const token = uuidv4();
    await this.tokenRepo.save({
      userId: user.id,
      type: TokenType.EMAIL_VERIFICATION,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    });
    
    // Send verification email
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
    const verificationUrl = `${appUrl}/verify-email?token=${token}`;
    
    try {
      const emailTemplate = this.emailService.generateVerificationEmail(name, verificationUrl);
      await this.emailService.sendEmail(email, emailTemplate);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't fail registration if email fails
    }
    
    return { user, verificationToken: token };
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
