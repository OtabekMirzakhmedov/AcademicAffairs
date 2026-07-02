# scientific-tasks

Top-down task assignment from admin or department head to teachers. Each task spawns one `TeacherScientificReport` per eligible teacher; reports follow the in_progress → submitted → validated workflow.

## Task endpoints
- `POST /scientific-tasks` — admin (university-wide if `departmentId` omitted) / head (own dept only).
- `GET /scientific-tasks` — list (scoped to caller's role).
- `GET /scientific-tasks/:id` — one task.
- `PATCH /scientific-tasks/:id` — creator: edit.
- `DELETE /scientific-tasks/:id` — creator: delete (cascades to reports).
- `GET /scientific-tasks/:id/progress` — head/admin: completion stats across all teachers for this task.

## Report endpoints
- `GET /scientific-tasks/reports/my` — teacher: their reports across all tasks.
- `GET /scientific-tasks/reports/submitted` — head: inbox awaiting validation in their department.
- `GET /scientific-tasks/reports/:id` — one report.
- `PATCH /scientific-tasks/reports/:id` — teacher: update progress, attach file.
- `POST /scientific-tasks/reports/:id/submit` — teacher: → `submitted`.
- `POST /scientific-tasks/reports/:id/validate` — head: → `validated`.
- `POST /scientific-tasks/reports/:id/reject` — head: → `rejected`.
- `POST /scientific-tasks/reports/upload` — multipart file upload. Returns `{ filePath, fileName }` to PATCH onto a report.
- `GET /scientific-tasks/reports/:id/download` — download attached file.

## Gotchas
- A task with `departmentId: null` is university-wide and only admin can create one.
- One report per `(scientificTaskId, teacherId)` pair — enforced by unique constraint.
- `executionStatus` (free text) is unrelated to the workflow `status` — see `glossary.md`.
- File uploads go through a separate endpoint; the report PATCH only stores the path.
