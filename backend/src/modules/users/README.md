# users

User CRUD and role lookup. A `User` row is the auth identity; personal details live on `UserInfo`, and teacher-specific data (employment, degrees, mandatory quotas) on `TeacherInfo`.

## Endpoints
- `GET /users/roles` — list all roles.
- `POST /users` — admin: create a generic user (admin / head). Body includes `userInfo` nested.
- `POST /users/teachers` — admin: create a teacher (creates `User` + `UserInfo` + `TeacherInfo` in one transaction).
- `PATCH /users/teachers/:id` — admin / head: update teacher-specific fields (`TeacherInfo`).
- `PATCH /users/:id/account` — self-service: update own contact fields on `UserInfo`.
- `GET /users` / `GET /users/:id` — list/get. Supports `?role=...` filter and search.
- `PATCH /users/:id` — admin: edit core user fields.
- `PATCH /users/:id/toggle-status` — admin: flip `isActive`.
- `DELETE /users/:id` — admin: hard delete (cascades to `UserInfo`, `TeacherInfo`).

## Gotchas
- All new users get `mustChangePassword: true` by default.
- A department head is also stored with a `TeacherInfo` row — they can log their own teaching hours.
- Deleting a user cascades through `UserInfo` and `TeacherInfo` but **not** through `TeachingActivity`, `TeacherPublication`, etc. Disable (`toggle-status`) instead of deleting active teachers.

## Related
- `auth` for login/password.
- `departments` for department assignments.
