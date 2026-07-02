# academic-periods

Semester definitions. Exactly one period has `isActive: true` at a time — that's "the current semester" everything else keys off.

## Endpoints
- `GET /academic-periods` — list all.
- `GET /academic-periods/active` — the single active period. Most teacher/head UI calls this first.

## Gotchas
- Activating a new period should atomically deactivate the previous one. If you add a "set active" endpoint, do it in a transaction.
- `teachingWeek` is a manual counter — admin bumps it (e.g. via a cron or weekly UI action). Nothing else writes to it.
- Course assignments (`CourseTeacher`) and teaching activities (`TeachingActivity`) are scoped per period. To start a new semester, create a new period and re-create assignments; don't reuse last period's rows.
