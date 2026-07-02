# teaching-activities

Per-period teaching hour logs. The central "how much is X teaching" entity. Follows the draft → submitted → validated workflow (see `docs/workflows.md`).

## Endpoints
- `POST /teaching-activities` — teacher: create draft.
- `GET /teaching-activities` — teacher: their own activities (filterable). Head/admin: scoped to their department / all.
- `GET /teaching-activities/stats` — teacher: aggregated hours vs `mandatoryHoursPerPeriod`.
- `GET /teaching-activities/:id` — one row.
- `PATCH /teaching-activities/:id` — teacher: edit while `draft` or `rejected`.
- `DELETE /teaching-activities/:id` — teacher: delete while `draft`.
- `POST /teaching-activities/:id/submit` — teacher: transition to `submitted`.
- `GET /teaching-activities/submitted/all` — head: inbox of submissions awaiting validation in their department.
- `POST /teaching-activities/:id/validate` — head: → `validated`.
- `POST /teaching-activities/:id/reject` — head: → `rejected`, with reason.

## Gotchas
- `totalHours` is computed server-side from the five hour fields on write — never trust client-supplied totals.
- `teacherId`, `courseId`, `academicPeriodId` are derived from `courseTeacherId` on creation. Don't accept them from the client.
- Only `validated` rows count toward `mandatoryHoursPerPeriod` in reports.
- Head can only validate activities belonging to teachers in their own department.

## Related
- `course-teachers` — assignment that this entry hangs off.
- `docs/workflows.md#teaching-activity` for the state diagram.
