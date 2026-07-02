# programs

Degree programs (e.g. "Mechanical Engineering, Bachelor"). A program belongs to one department and bundles courses via `ProgramCourse` (which carries `isRequired` and `recommendedSemester`).

## Endpoints
- `POST /programs` — admin / head: create.
- `GET /programs` / `GET /programs/:id` — list/get. `:id` includes courses.
- `PATCH /programs/:id` — edit.
- `DELETE /programs/:id` — delete (cascades to `ProgramCourse`).
- `POST /programs/:id/courses` — add a course to the program. Body: `{ courseId, isRequired?, recommendedSemester? }`.
- `PATCH /programs/:id/courses/:courseId` — update the join row.
- `DELETE /programs/:id/courses/:courseId` — remove a course from the program.

## Fields
- `degreeLevel`: `BACHELOR`, `MASTER`, `DOCTORATE`, `UNDERGRADUATE`, `GRADUATE`.
- `code` is unique system-wide (e.g. `ME-MECH`).
- `totalCreditsRequired` is the program's credit target.

## Gotchas
- `(programId, courseId)` is unique on `ProgramCourse` — a course can only be in a program once. To mark it both required and elective for different cohorts, you'd need to extend the schema.
- The seed does not create any programs. Templates exist (`program_template.xlsx` at repo root) but no import endpoint yet.
