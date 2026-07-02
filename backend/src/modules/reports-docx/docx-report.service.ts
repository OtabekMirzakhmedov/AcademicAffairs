import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

@Injectable()
export class DocxReportService {
  private readonly logger = new Logger(DocxReportService.name);

  /**
   * Fills a `.docx` template's `{placeholder}` tags with `data` and returns
   * the rendered document as a Buffer.
   */
  render(templatePath: string, data: Record<string, unknown>): Buffer {
    if (!existsSync(templatePath)) {
      throw new NotFoundException(`Word template not found: ${templatePath}`);
    }
    const content = readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.render(data);

    return doc.getZip().generate({ type: 'nodebuffer' });
  }
}
