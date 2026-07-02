import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { join } from 'path';
import { Liquid } from 'liquidjs';
import puppeteer, { Browser } from 'puppeteer';

@Injectable()
export class PdfReportService implements OnModuleDestroy {
  private readonly logger = new Logger(PdfReportService.name);
  // Templates are read from the source tree (not `dist/`) because this
  // repo's build/deploy (see render.yaml) keeps `src/` alongside `dist/` at
  // runtime, and `dist/`'s output layout doesn't mirror `src/` 1:1 (prisma/
  // is compiled alongside src/, so plain __dirname-relative asset copying
  // doesn't land where you'd expect).
  private readonly liquid = new Liquid({
    root: join(process.cwd(), 'src', 'modules', 'reports-pdf', 'templates'),
    extname: '.liquid',
  });
  private browser: Browser | null = null;

  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({ headless: true });
    }
    return this.browser;
  }

  /**
   * Renders a `.liquid` HTML template (from this module's `templates/` dir)
   * with the given data and returns a PDF as a Buffer.
   */
  async renderToPdf(
    templateName: string,
    data: Record<string, unknown>,
  ): Promise<Buffer> {
    const html = (await this.liquid.renderFile(templateName, data)) as string;
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    try {
      await page.setContent(html, { waitUntil: 'load' });
      const pdf = await page.pdf({ format: 'A4', printBackground: true });
      return Buffer.from(pdf);
    } finally {
      await page.close();
    }
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.logger.log('Closed shared Puppeteer browser instance');
    }
  }
}
