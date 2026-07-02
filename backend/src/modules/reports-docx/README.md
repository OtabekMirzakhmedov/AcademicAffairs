# reports-docx

Fills official `.docx` forms with app data using docxtemplater + pizzip. Isolated from `reports-pdf` and `reports-excel` — no shared code with either.

## Usage
Inject `DocxReportService` from the domain module that owns the template:
```ts
const buffer = this.docxReportService.render(templatePath, {
  teacherName: teacher.fullName,
  hours: totalHours,
});
```
The `.docx` template uses docxtemplater's `{placeholder}` syntax (edit the template in Word, insert `{fieldName}` where data should go). Return the buffer from a controller as a `StreamableFile` — see `research-activities.controller.ts`'s `downloadFile` for the header/`StreamableFile` pattern this repo uses for binary responses.

## Templates
Binary `.docx` templates live next to the domain module that owns them (e.g. `backend/src/modules/<module>/templates/<name>.docx`), not in this module. Resolve the template path via `join(process.cwd(), 'src', 'modules', '<module>', 'templates', '<file>.docx')` rather than `__dirname` — this repo's build keeps `src/` alongside `dist/` at runtime (see `render.yaml`), and `dist/`'s output layout doesn't mirror `src/` 1:1, so `dist`-relative asset resolution doesn't land reliably (see `reports-pdf/README.md` for the full explanation).

## Removing this module
If Word export is no longer needed:
1. Delete `backend/src/modules/reports-docx/`.
2. Remove the `ReportsDocxModule` import from `backend/src/app.module.ts`.
3. Remove any domain module imports of `ReportsDocxModule`.
4. `npm uninstall docxtemplater pizzip` in `backend/`.

No other module depends on this one's internals.
