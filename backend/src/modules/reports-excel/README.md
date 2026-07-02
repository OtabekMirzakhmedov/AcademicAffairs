# reports-excel

Fills official `.xlsx` forms with app data using ExcelJS. Isolated from `reports-pdf` and `reports-docx` — no shared code with either.

## Usage
Inject `ExcelReportService` from the domain module that owns the template (e.g. `programs`):
```ts
const workbook = await this.excelReportService.loadTemplate(templatePath);
const sheet = workbook.getWorksheet(1);
sheet.getCell('B5').value = program.name;
// ... fill the rest of the cells the template expects
const buffer = await this.excelReportService.toBuffer(workbook);
```
Cell-to-field mapping is intentionally kept in the domain module (it's the one that knows the template's layout), not in this service. Return the buffer from a controller as a `StreamableFile` — see `research-activities.controller.ts`'s `downloadFile` for the header/`StreamableFile` pattern this repo uses for binary responses.

## Templates
Binary `.xlsx` templates live next to the domain module that owns them (e.g. `backend/src/modules/programs/templates/program_template.xlsx`), not in this module. Resolve the template path via `join(process.cwd(), 'src', 'modules', '<module>', 'templates', '<file>.xlsx')` rather than `__dirname` — this repo's build keeps `src/` alongside `dist/` at runtime (see `render.yaml`), and `dist/`'s output layout doesn't mirror `src/` 1:1, so `dist`-relative asset resolution doesn't land reliably (see `reports-pdf/README.md` for the full explanation).

## Removing this module
If Excel export is no longer needed:
1. Delete `backend/src/modules/reports-excel/`.
2. Remove the `ReportsExcelModule` import from `backend/src/app.module.ts`.
3. Remove any domain module imports of `ReportsExcelModule`.
4. `npm uninstall exceljs` in `backend/`.

No other module depends on this one's internals.
