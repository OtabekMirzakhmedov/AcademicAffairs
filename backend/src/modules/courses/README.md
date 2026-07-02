# courses

A course is a subject (e.g. "Rational Mechanics"). Belongs to one department; can appear in multiple programs via `ProgramCourse`.

## Endpoints
- `POST /courses` — admin / head: create.
- `GET /courses` / `GET /courses/:id` — list/get.
- `PATCH /courses/:id` — admin / head: edit.
- `DELETE /courses/:id` — admin / head: delete. Cascades to `CourseTeacher` (FK cascade) and unlinks `ProgramCourse` rows in a transaction. Blocked with `409 Conflict` when the course has any `TeachingActivity` rows — those are workload history and must be removed first.

## Fields
- `lectureHours` / `practiceHours` are *planned* hours per the curriculum, not what was taught. The actual taught hours go on `TeachingActivity`.

## Related
- `programs` to bundle courses into degree programs.
- `course-teachers` to assign teachers per period.
