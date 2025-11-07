import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'localhost'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    const from = this.configService.get<string>('SMTP_FROM', 'noreply@attendance.local');
    
    try {
      await this.transporter.sendMail({
        from,
        to,
        subject: template.subject,
        html: template.html,
        text: template.text || template.html.replace(/<[^>]*>/g, ''),
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  generateVerificationEmail(name: string, verificationUrl: string): EmailTemplate {
    return {
      subject: 'Verify Your Email - Student Attendance',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome ${name}!</h2>
          <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
          <p style="margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email
            </a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
        </div>
      `,
    };
  }

  generatePasswordResetEmail(name: string, resetUrl: string): EmailTemplate {
    return {
      subject: 'Password Reset - Student Attendance',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. Click the link below to set a new password:</p>
          <p style="margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
        </div>
      `,
    };
  }

  generateLeaveNotificationEmail(
    userName: string,
    leaveType: string,
    startDate: string,
    endDate: string,
    status: string,
    approverComment?: string,
  ): EmailTemplate {
    const statusColor = status === 'approved' ? '#4CAF50' : status === 'rejected' ? '#f44336' : '#FF9800';
    
    return {
      subject: `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)} - Student Attendance`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Leave Request Update</h2>
          <p>Hi ${userName},</p>
          <p>Your leave request has been <strong style="color: ${statusColor};">${status}</strong>.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Leave Type:</strong> ${leaveType}</p>
            <p style="margin: 5px 0;"><strong>Start Date:</strong> ${startDate}</p>
            <p style="margin: 5px 0;"><strong>End Date:</strong> ${endDate}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${statusColor};">${status}</span></p>
          </div>
          ${approverComment ? `<p><strong>Approver Comment:</strong><br>${approverComment}</p>` : ''}
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">This is an automated notification from the Student Attendance system.</p>
        </div>
      `,
    };
  }

  generateAttendanceReminderEmail(
    userName: string,
    className: string,
    sessionDate: string,
    sessionTime: string,
  ): EmailTemplate {
    return {
      subject: 'Attendance Reminder - Student Attendance',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Attendance Reminder</h2>
          <p>Hi ${userName},</p>
          <p>This is a reminder to mark attendance for:</p>
          <div style="background-color: #E3F2FD; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Class:</strong> ${className}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${sessionDate}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${sessionTime}</p>
          </div>
          <p>Please ensure you mark your attendance on time.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">This is an automated notification from the Student Attendance system.</p>
        </div>
      `,
    };
  }
}
