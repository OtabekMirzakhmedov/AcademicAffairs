# Seed Data Reference

What `npx prisma db seed` creates (`backend/prisma/seed.ts`). Use these IDs and credentials in tests, manual QA, and API examples.

## Run

```bash
cd backend
npm run build         # seed script runs from dist/
npx prisma db seed
```

The seed is idempotent (uses `upsert` keyed by login / id), so re-running is safe.

## Roles

| id | name |
|---|---|
| 1 | `admin` |
| 2 | `departmenthead` |
| 3 | `teacher` |

(Role ids depend on insertion order — don't hard-code them; look up by `name`.)

## Users

All non-admin users share the password `pass123`. Admin uses `admin123`. All seeded users have `mustChangePassword: true` — log in once and change it, or set the flag to `false` in the DB for test fixtures.

| Login | Password | Role | Name | Department | Employment | Mandatory hrs |
|---|---|---|---|---|---|---|
| `admin` | `admin123` | admin | System Administrator | — | — | — |
| `headdep1` | `pass123` | departmenthead | Sarvar Yusupov | Mechanical Engineering | full-time | 300 |
| `headdep2` | `pass123` | departmenthead | Kamolliddin Abdivahidov | Energy and applied sciences | full-time | 300 |
| `teacher1` | `pass123` | teacher | Otabek Mirzakhmedov | Mechanical Engineering | full-time | 550 |
| `teacher2` | `pass123` | teacher | Malika Platoshina | Energy and applied sciences | full-time | 550 |
| `teacher3` | `pass123` | teacher | Sardor Musurmonov | Mechanical Engineering | part-time | 250 |
| `teacher4` | `pass123` | teacher | Abror Xoshimov | Mechanical Engineering | contract | 150 |

Department heads also have `mandatoryScopusArticles: 0`; `teacher1` and `teacher2` have `mandatoryScopusArticles: 1`.

## Departments

| id | Name | Head |
|---|---|---|
| 1 | Mechanical Engineering | Sarvar Yusupov (`headdep1`) |
| 2 | Energy and applied sciences | Kamolliddin Abdivahidov (`headdep2`) |

## Academic Period

| id | Year | Semester | Active | Dates |
|---|---|---|---|---|
| 1 | `<currentYear>-<currentYear+1>` (computed at seed time) | 1 | ✅ | Sept 1 – Jan 31 |

## Courses

| id | Name | Department |
|---|---|---|
| 1 | Engineering linear systems | Mechanical Engineering |
| 2 | Rational mechanics | Mechanical Engineering |
| 3 | Project management | Mechanical Engineering |
| 4 | Strength of Materials | Energy and applied sciences |

`lectureHours` / `practiceHours` are left at the default `0` — fill in per real curriculum.

## Course Assignments (CourseTeacher)

All in academic period 1.

| id | Course | Teacher |
|---|---|---|
| 1 | Engineering linear systems | Otabek Mirzakhmedov |
| 2 | Rational mechanics | Otabek Mirzakhmedov |
| 3 | Project management | Abror Xoshimov |
| 4 | Strength of Materials | Malika Platoshina |

`groups` is `null` on all assignments — set by the department head per real groups.

## Research Activity Templates

Seven templates in category `scientific_main`, with penalty percentages:

| Name | Penalty |
|---|---|
| Participation in international scientific conferences | 5% |
| Supervising a master's student's thesis | 10% |
| Populating the LMS and UMO platforms with data | 15% |
| Project preparation and participation in international grants (Erasmus+, HORIZON 2020, etc.) | 5% |
| Publication of articles in Scopus journals and conferences | 10% |
| Preparation and publication of articles in national scientific journals (VAK) | 10% |
| Documentations | 5% |

Only inserted if no templates already exist.

## What's NOT seeded

- No programs / program-course mappings.
- No publications, teaching activities, scientific tasks, or scientific reports.
- No `UserInfo` beyond first/last name + one email + one phone.

To exercise the full workflow against seeded data, log in as `teacher1`, hit `GET /api/course-teachers/my-assignments`, and follow the flow in `docs/api-examples.md`.
