# Glossary

Domain terms used across the Academic Affairs codebase. When a term is ambiguous in code (e.g. `status` means different things on different entities), the table below is authoritative.

## Roles

| Role | DB value | Capabilities |
|---|---|---|
| Administrator | `admin` | Manages users, departments, courses, programs, academic periods, scientific tasks, research activity templates. Sees university-wide data. |
| Department Head | `departmenthead` | Manages teachers in their own department, assigns teachers to courses, validates submissions from their teachers. |
| Teacher | `teacher` | Logs teaching hours, submits publications, completes scientific tasks and research activities. Sees only their own data. |

A department head is also a teacher under the hood — they have a `TeacherInfo` row and can log their own teaching hours.

## Academic Period

A semester. Identified by `academicYear` (e.g. `"2025-2026"`) + `semester` (`1` or `2`). Exactly one period is `isActive = true` at a time — the rest of the system reads "the current period" from that flag. `teachingWeek` is the current week number within the active semester; admin advances it manually.

## Employment Type

Set on `TeacherInfo.employmentType`. Affects the default `mandatoryHoursPerPeriod`.

| Value | Meaning |
|---|---|
| `full-time` | Staff teacher. Typical load: 550 hrs/period. |
| `part-time` | Reduced load. Typical: 250 hrs/period. |
| `contract` | Externally contracted. Typical: 150 hrs/period. |

Nullable until the department head assigns it.

## Mandatory Quotas (per teacher, per academic period)

All set on `TeacherInfo` by the department head or admin. The teacher dashboard compares logged work against these targets.

| Field | Meaning |
|---|---|
| `mandatoryHoursPerPeriod` | Total teaching hours the teacher must log this period. |
| `mandatoryExtracurricularHours` | Non-classroom hours (advising, mentoring) expected. |
| `mandatoryConferenceArticles` | Conference papers expected. |
| `mandatoryNationalArticles` | Papers in nationally-recognized journals expected. Tied to VAK (the Higher Attestation Committee). |
| `mandatoryScopusArticles` | Scopus-indexed papers expected. |
| `mandatoryDocumentation` | Documentation deliverables expected. |

## Teaching Hour Types

Logged on `TeachingActivity`. All decimals (fractional hours allowed).

| Field | Meaning |
|---|---|
| `lectureHours` | Hours spent delivering lectures. |
| `practiceHours` | Hours in practice / problem-solving sessions. |
| `labHours` | Hours in laboratory sessions. |
| `seminarHours` | Hours in seminar discussions. |
| `advisingHours` | Hours advising students outside of class (thesis, project supervision). |
| `totalHours` | Computed sum of the above, persisted on write. |

`groups` is a JSON array of group names the teacher taught (e.g. `["ME-21-1", "ME-21-2"]`).

## Status Values

**Important:** different entities use different status vocabularies. Do not assume `status` means the same thing everywhere.

| Entity | Initial | Terminal states |
|---|---|---|
| `TeachingActivity.status` | `draft` | `validated`, `rejected` |
| `TeacherPublication.status` | `draft` | `validated`, `rejected` |
| `TeacherScientificReport.status` | `in_progress` | `validated`, `rejected` |
| `TeacherResearchActivity.status` | `in_progress` | `validated`, `rejected` |

Intermediate state for all four: `submitted` (teacher has finished, waiting on head). See `docs/workflows.md` for transitions.

`TeacherScientificReport` also has a separate `executionStatus` free-text field — that's the teacher's own description of how the work is going, unrelated to the validation workflow.

## Publication Types

`TeacherPublication.publicationType`:

| Value | Meaning |
|---|---|
| `conference` | Conference proceedings. |
| `national` | National journal article (VAK-recommended). |
| `scopus` | Scopus-indexed journal article. |

## Research Activity Categories

`ResearchActivityTemplate.category`:

| Value | Meaning |
|---|---|
| `scientific_main` | Core scientific output (publications, conference participation, thesis supervision). The default. |
| `scientific_exchange` | International exchange and collaboration. |
| `educational_additional` | Extra teaching-related work beyond mandatory hours. |
| `additional` | Other duties. |
| `educational` | Standard educational work. |

`penalty` (percent) is deducted from the teacher's score if the activity isn't completed by deadline. `maxAmount` caps how much the activity can contribute.

## Programs and Courses

- **Program** — A degree program (e.g. "Mechanical Engineering, Bachelor"). Has a `degreeLevel`: `BACHELOR`, `MASTER`, `DOCTORATE`, `UNDERGRADUATE`, `GRADUATE`. Belongs to one department.
- **Course** — A subject taught (e.g. "Rational Mechanics"). Belongs to one department. Can appear in multiple programs.
- **ProgramCourse** — Join row linking a course into a program. `isRequired` (required vs elective) and `recommendedSemester` (1..N).
- **CourseTeacher** — Assignment of a teacher to a course for one academic period. Created by the department head. `groups` is an optional JSON array of group names.

A teacher cannot log a `TeachingActivity` for a course they haven't been assigned to via `CourseTeacher`.

## External Reference Terms

These appear in seed data and templates; they're external systems / authorities, not entities in this codebase.

| Term | Meaning |
|---|---|
| VAK / Higher Attestation Committee | Uzbekistan's national body that certifies academic journals. "National articles" are VAK-recommended publications. |
| LMS / UMO | The university's learning management and educational organization platforms. Teachers are expected to keep data on these populated. |
| Scopus | Elsevier's citation database. Scopus-indexed publications carry the most weight. |
| Erasmus+ / HORIZON 2020 | International research grant programs teachers are encouraged to participate in. |
| PhD / DSc | Doctor of Philosophy / Doctor of Science. DSc is the higher Soviet-tradition doctorate, separate from PhD on `TeacherInfo`. |
| STIR / INN | Uzbek taxpayer ID number. Stored on `UserInfo.stirInn`. |
| Personal ID | 14-digit Uzbek national ID. Stored on `UserInfo.personalId`. |
