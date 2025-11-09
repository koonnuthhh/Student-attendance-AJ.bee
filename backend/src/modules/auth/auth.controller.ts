import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RoleName } from '../users/role.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: any,
    @Body('email') email: string,
    @Body('name') name: string,
    @Body('password') password: string,
    @Body('role') role?: RoleName,
    @Body('studentCode') studentCode?: string, // Keep old name for backward compatibility
    @Body('studentId') studentId?: string, // New parameter name
  ) {
    console.log('Registration attempt - raw body:', JSON.stringify(body));
    
    // Use studentId if provided, otherwise fall back to studentCode for backward compatibility
    const actualStudentId = studentId || studentCode;
    
    console.log('Registration attempt - parsed:', { 
      email, 
      name: !!name, 
      password: !!password, 
      role, 
      studentId: actualStudentId ? `"${actualStudentId}" (length: ${actualStudentId.length})` : 'undefined'
    });

    // Basic validation
    if (!email || !name || !password) {
      console.error('Missing required fields for registration');
      throw new Error('Missing required fields: email, name, and password');
    }

    try {
      const result = await this.authService.register(email, name, password, role, actualStudentId);
      console.log('Registration successful for:', email);
      return result;
    } catch (error) {
      console.error('Registration failed:', error.message);
      throw error;
    }
  }

  @Post('login')
  async login(@Body('email') email: string, @Body('password') password: string) {
    return this.authService.login(email, password);
  }

  @Post('verify-email')
  async verifyEmail(@Body('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  async resetPassword(@Body('token') token: string, @Body('newPassword') newPassword: string) {
    return this.authService.resetPassword(token, newPassword);
  }
}
