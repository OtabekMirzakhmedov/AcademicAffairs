import { Module } from '@nestjs/common';
import { PdfReportService } from './pdf-report.service';

@Module({
  providers: [PdfReportService],
  exports: [PdfReportService],
})
export class ReportsPdfModule {}
