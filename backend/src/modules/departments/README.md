# departments

Departments group teachers and own courses. One department has at most one head (`headId` → `User`).

## Endpoints
- `POST /departments` — admin: create.
- `GET /departments` / `GET /departments/:id` — list/get. Includes head info and counts.
- `PATCH /departments/:id` — admin: edit. Use this to set/change the `headId`.
- `DELETE /departments/:id` — admin: delete. Blocked if teachers or courses still reference it.

## Gotchas
- Changing `headId` does not change the previous head's role — strip / reassign their role via the `users` module separately if needed.
- A department head can only see and validate work from teachers in their own department; that scope is enforced in the consuming modules (`teaching-activities`, `publications`, etc.), not here.
