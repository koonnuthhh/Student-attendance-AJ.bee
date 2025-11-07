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

  @Get('validate/:code')
  async validateCode(@Param('code') code: string) {
    const result = await this.studentCodesService.validateCode(code);
    return {
      isValid: result.isValid,
      isUsed: result.isUsed,
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