import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ExportsService } from './exports.service';
import * as fs from 'fs';

@Controller('exports')
@UseGuards(AuthGuard('jwt'))
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get('attendance.csv')
  async exportCSV(@Query() filters: any, @Res() res: Response) {
    const { filePath } = await this.exportsService.exportCSV(filters);
    res.download(filePath, () => {
      fs.unlinkSync(filePath);
    });
  }

  @Get('attendance.xlsx')
  async exportXLSX(@Query() filters: any, @Res() res: Response) {
    const { filePath } = await this.exportsService.exportXLSX(filters);
    res.download(filePath, () => {
      fs.unlinkSync(filePath);
    });
  }
}
