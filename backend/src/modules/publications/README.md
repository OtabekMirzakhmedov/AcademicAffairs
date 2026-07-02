# publications

Teacher publications across three types: `conference`, `national` (VAK-recommended), `scopus`. Counts toward the teacher's mandatory article quotas only after validation.

## Endpoints
- `POST /publications` — teacher: create draft.
- `GET /publications` — teacher: own list. Head/admin: their department / all.
- `GET /publications/statistics` — teacher: validated count per type vs mandatory quotas.
- `GET /publications/:id` — one row.
- `PATCH /publications/:id` — teacher: edit (also used by head to set `status`/`rejectionReason`).
- `PATCH /publications/:id/submit` — teacher: → `submitted`.
- `DELETE /publications/:id` — teacher: delete (while `draft`).

## Gotchas
- Unlike `teaching-activities`, validation/rejection here is folded into the generic `PATCH` rather than dedicated endpoints. If you add separate `/validate` and `/reject` endpoints later, keep the PATCH path back-compatible until the frontend is migrated.
- `doi` is unique across the whole table.
- `rejectionReason` lives on the row itself, not a separate audit log.
