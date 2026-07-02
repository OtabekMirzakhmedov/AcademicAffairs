# research-activities

Catalog of research activity *templates* (managed by admin) plus *instances* a teacher creates against them. Instances follow the in_progress → submitted → validated workflow.

## Template endpoints (admin)
- `GET /research-activities/templates` — active templates (used in teacher UI).
- `GET /research-activities/templates/admin` — all (incl. inactive).
- `POST /research-activities/templates` — create.
- `PATCH /research-activities/templates/:id` — edit. Use `isActive: false` to retire rather than delete.
- `DELETE /research-activities/templates/:id` — only if no teacher activities reference it.

## Teacher activity endpoints
- `GET /research-activities/my` — teacher: their activities.
- `POST /research-activities` — teacher: create against a template.
- `PATCH /research-activities/:id` — teacher: update progress.
- `DELETE /research-activities/:id` — teacher: delete (while `in_progress`).
- `POST /research-activities/:id/submit` — teacher: → `submitted`.
- `POST /research-activities/:id/validate` — head: → `validated`.
- `POST /research-activities/:id/reject` — head: → `rejected`.
- `POST /research-activities/upload` — multipart upload. Returns `{ filePath, fileName }`.
- `GET /research-activities/:id/download` — download attachment.

## Gotchas
- One instance per `(teacherId, templateId)` pair.
- `penalty` on the template applies if `deadline` passes without `validated` status — currently informational; no automatic enforcement.
- Seeded templates are all `category: scientific_main`; other categories exist (see `glossary.md`) but aren't populated by default.
