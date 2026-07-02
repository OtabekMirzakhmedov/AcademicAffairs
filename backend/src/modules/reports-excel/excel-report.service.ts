import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { existsSync } from 'fs';
import ExcelJS from 'exceljs';

@Injectable()
export class ExcelReportService {
  private readonly logger = new Logger(ExcelReportService.name);

  /**
   * Loads an `.xlsx` template from disk. The caller (the domain module that
   * owns the template) fills in cells on the returned workbook directly —
   * this service only handles the generic load/serialize steps.
   */
  async loadTemplate(templatePath: string): Promise<ExcelJS.Workbook> {
    if (!existsSync(templatePath)) {
      throw new NotFoundException(`Excel template not found: ${templatePath}`);
    }
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    return workbook;
  }

  async toBuffer(workbook: ExcelJS.Workbook): Promise<Buffer> {
    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }
}
