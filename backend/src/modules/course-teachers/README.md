# course-teachers

Assigns a teacher to a course for one academic period. The pivot row that gates a teacher's ability to log hours against a course.

## Endpoints
- `POST /course-teachers` — head / admin: assign.
- `GET /course-teachers/my-assignments` — **teacher**: their own assignments in the active period. The starting point for the teaching-activity flow.
- `GET /course-teachers` — list (filterable).
- `GET /course-teachers/:id` — get one.
- `PATCH /course-teachers/:id` — head: edit `groups`.
- `DELETE /course-teachers/:id` — head: unassign (cascades to `TeachingActivity` for that assignment — be careful in production).

## Gotchas
- A teacher cannot create a `TeachingActivity` for a course they don't have a `CourseTeacher` row against for the active period.
- `groups` is a JSON array (`string[]`) on this row, set by the head. Teachers also write a `groups` array on each `TeachingActivity` — those can differ (e.g. teacher only taught half the assigned groups in a given log).
