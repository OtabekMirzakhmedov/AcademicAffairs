# reports-pdf

Generates PDF reports by rendering a LiquidJS HTML template and printing it with headless Chromium (Puppeteer). Isolated from `reports-excel` and `reports-docx` — no shared code with either.

## Usage
Inject `PdfReportService` and call:
```ts
const pdf = await this.pdfReportService.renderToPdf('my-report', { teacher, hours });
```
`renderToPdf(templateName, data)` looks up `templates/<templateName>.liquid` (relative to this module), renders it with the given data, and returns a `Buffer`. Return it from a controller as a `StreamableFile` — see `research-activities.controller.ts`'s `downloadFile` for the header/`StreamableFile` pattern this repo uses for binary responses (no `{success,data,message}` envelope for file downloads).

## Templates
Add `.liquid` HTML files to `templates/`. They're plain HTML with Liquid syntax (`{{ field }}`, `{% for x in list %}`). Templates are read directly from `src/modules/reports-pdf/templates/` at runtime via `process.cwd()`, **not** from `dist/` — this repo's build keeps `src/` alongside `dist/` in production (see `render.yaml`), and `dist/`'s output layout doesn't mirror `src/` 1:1 (prisma is compiled into the same `dist/` tree), so `__dirname`-relative asset copying doesn't land reliably. Don't try to wire up `nest-cli.json` asset copying for this — it was tried and the resulting path didn't match where the compiled service actually looks.

The Puppeteer browser instance is launched lazily and reused across requests; it's closed automatically on app shutdown (`OnModuleDestroy`).

## Removing this module
If PDF export is no longer needed:
1. Delete `backend/src/modules/reports-pdf/`.
2. Remove the `ReportsPdfModule` import from `backend/src/app.module.ts`.
3. Remove any domain module imports of `ReportsPdfModule`.
4. `npm uninstall liquidjs puppeteer` in `backend/`.

No other module depends on this one's internals.
