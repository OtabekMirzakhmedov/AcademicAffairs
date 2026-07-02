import { Module } from '@nestjs/common';
import { DocxReportService } from './docx-report.service';

@Module({
  providers: [DocxReportService],
  exports: [DocxReportService],
})
export class ReportsDocxModule {}
