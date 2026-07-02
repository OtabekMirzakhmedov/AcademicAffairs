# Workflows

State transitions for the four validation-bearing entities. All four follow the same shape but use different vocabulary — see `glossary.md` for the differences.

## The shared pattern

```
[initial]  →  submitted  →  validated   (terminal: counted in totals)
                          ↘  rejected    (teacher can edit and resubmit)
```

- The **teacher** owns the transition out of the initial state (submit).
- The **department head** owns transitions out of `submitted` (validate or reject).
- Admin generally does not validate operationally, but has read access.
- `rejected` is not terminal: the teacher edits and re-submits, returning to `submitted`.

Timestamps are written on transition: `submittedAt`, `validatedAt`. The validator's user id is stored on `validatedBy`.

## Teaching Activity

`TeachingActivity.status`:

| From | To | Actor | Endpoint |
|---|---|---|---|
| — | `draft` | Teacher | `POST /api/teaching-activities` |
| `draft` | `draft` | Teacher | `PATCH /api/teaching-activities/:id` (edit hours) |
| `draft` | `submitted` | Teacher | `POST /api/teaching-activities/:id/submit` |
| `submitted` | `validated` | Department head | `POST /api/teaching-activities/:id/validate` |
| `submitted` | `rejected` | Department head | `POST /api/teaching-activities/:id/reject` |
| `rejected` | `submitted` | Teacher | `POST /api/teaching-activities/:id/submit` |

Constraints:
- A teacher can only create an activity for a `CourseTeacher` row that points to them.
- A department head can only validate activities for teachers in their own department.
- Only `validated` activities count toward `mandatoryHoursPerPeriod`.

## Publication

`TeacherPublication.status`:

| From | To | Actor | Endpoint |
|---|---|---|---|
| — | `draft` | Teacher | `POST /api/publications` |
| `draft` | `draft` | Teacher | `PATCH /api/publications/:id` |
| `draft` | `submitted` | Teacher | `PATCH /api/publications/:id/submit` |
| `submitted` | `validated` | Department head | (via update endpoint setting status) |
| `submitted` | `rejected` | Department head | (via update endpoint with `rejectionReason`) |

Note: publications use a single `PATCH` for validation/rejection rather than dedicated endpoints. `rejectionReason` is a column on the row.

Constraints:
- `doi` is unique across all publications system-wide.
- Only `validated` publications count toward the teacher's mandatory article quotas (by `publicationType`).

## Scientific Report

`TeacherScientificReport.status`:

| From | To | Actor | Endpoint |
|---|---|---|---|
| — | `in_progress` | Auto-created when teacher first opens a task they're eligible for (or via PATCH) | — |
| `in_progress` | `in_progress` | Teacher | `PATCH /api/scientific-tasks/reports/:id` (update progress, upload file) |
| `in_progress` | `submitted` | Teacher | `POST /api/scientific-tasks/reports/:id/submit` |
| `submitted` | `validated` | Department head | `POST /api/scientific-tasks/reports/:id/validate` |
| `submitted` | `rejected` | Department head | `POST /api/scientific-tasks/reports/:id/reject` |
| `rejected` | `submitted` | Teacher | `POST /api/scientific-tasks/reports/:id/submit` |

Notes:
- `executionStatus` is unrelated to the workflow — it's a free-text field where the teacher describes progress qualitatively.
- `completionPercentage` (0..100) and `equivalentHours` track quantitative progress.
- A scientific task with `departmentId = NULL` applies to all departments; with a `departmentId` set, only to teachers in that department.
- Uniqueness: one report per `(scientificTaskId, teacherId)` pair.

## Research Activity

`TeacherResearchActivity.status`:

| From | To | Actor | Endpoint |
|---|---|---|---|
| — | `in_progress` | Teacher creates against a template | `POST /api/research-activities` |
| `in_progress` | `in_progress` | Teacher | `PATCH /api/research-activities/:id` |
| `in_progress` | `submitted` | Teacher | `POST /api/research-activities/:id/submit` |
| `submitted` | `validated` | Department head | `POST /api/research-activities/:id/validate` |
| `submitted` | `rejected` | Department head | `POST /api/research-activities/:id/reject` |
| `rejected` | `submitted` | Teacher | `POST /api/research-activities/:id/submit` |

Notes:
- One activity per `(teacherId, templateId)` pair.
- `penalty` on the template applies if `deadline` passes without `validated` status.

## File attachments

Scientific reports and research activities accept file uploads:

- `POST /api/scientific-tasks/reports/upload` (multipart) → returns `filePath` + `fileName`, then teacher PATCHes the report.
- `POST /api/research-activities/upload` (multipart) → same pattern.

Downloads:
- `GET /api/scientific-tasks/reports/:id/download`
- `GET /api/research-activities/:id/download`

## Role-based access matrix (summary)

| Action | Admin | Dept Head | Teacher |
|---|---|---|---|
| Create/edit own draft | — | own | own |
| Submit own | — | own | own |
| Validate / reject | view-only | own dept | — |
| See aggregates | university-wide | own dept | own only |
| Manage templates / tasks | yes | own dept (tasks only) | — |
