import { Module } from '@nestjs/common';
import { ExcelReportService } from './excel-report.service';

@Module({
  providers: [ExcelReportService],
  exports: [ExcelReportService],
})
export class ReportsExcelModule {}
