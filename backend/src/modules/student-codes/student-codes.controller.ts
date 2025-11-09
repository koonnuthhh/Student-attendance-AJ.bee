import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StudentCodesService } from './student-codes.service';

@Controller('student-codes')
@UseGuards(AuthGuard('jwt'))
export class StudentCodesController {
  constructor(private readonly studentCodesService: StudentCodesService) {}

  @Post('generate')
  async generateCode() {
    const code = await this.studentCodesService.generateUniqueCode();
    return { code };
  }

  @Post('generate-for-class/:classId')
  async generateCodeForClass(@Param('classId') classId: string) {
    const code = await this.studentCodesService.createStudentCodeForClass(classId);
    return { code, classId, message: 'Student code created and enrolled in class' };
  }

  @Get('validate/:code')
  async validateCode(@Param('code') code: string) {
    const result = await this.studentCodesService.validateCode(code);
    const classes = result.isValid ? await this.studentCodesService.getClassesForCode(code) : [];
    
    return {
      isValid: result.isValid,
      isUsed: result.isUsed,
      associatedClasses: classes.map(cls => ({
        id: cls.id,
        name: cls.name,
        subject: cls.subject,
        teacher: cls.teacher?.name || 'Unknown'
      }))
    };
  }

  @Get('unused')
  async getUnusedCodes() {
    const codes = await this.studentCodesService.getUnusedCodes();
    return codes.map(user => ({
      code: user.studentCode,
      generatedAt: user.studentCodeGeneratedAt,
      isExpired: this.studentCodesService.isCodeExpired(user.studentCodeGeneratedAt!)
    }));
  }

  @Post('cleanup')
  async cleanupExpired() {
    const count = await this.studentCodesService.cleanupExpiredCodes();
    return { cleaned: count };
  }
}