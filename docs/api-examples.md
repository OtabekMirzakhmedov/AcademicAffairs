# API Examples

Practical curl examples for the most common flows. Base URL: `http://localhost:3000/api`. Authoritative endpoint reference is the Swagger UI at `http://localhost:3000/api/docs`.

All responses are wrapped: `{ "success": true, "data": ..., "message": "..." }`. Examples below show `data` content unrapped for brevity.

## Auth

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin","password":"admin123","rememberMe":false}'
```
Response includes `accessToken` (30 min) and `refreshToken` (7 d, or 30 d with `rememberMe: true`).

`mustChangePassword: true` on the returned user means the client should redirect to the change-password page before anything else.

### Refresh
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refresh>"}'
```

### Change password (after first login)
```bash
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"admin123","newPassword":"NewStrongPass1!"}'
```

### Profile
```bash
curl http://localhost:3000/api/auth/profile -H "Authorization: Bearer <token>"
```

## Teacher: log and submit teaching hours

### 1. Find your course assignments for the active period
```bash
curl http://localhost:3000/api/course-teachers/my-assignments \
  -H "Authorization: Bearer <teacher-token>"
```
Returns the `CourseTeacher` rows linking this teacher to courses in the currently active academic period. Note the `id` — that's the `courseTeacherId` you'll need next.

### 2. Create a teaching activity (draft)
```bash
curl -X POST http://localhost:3000/api/teaching-activities \
  -H "Authorization: Bearer <teacher-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "courseTeacherId": 1,
    "groups": ["ME-21-1", "ME-21-2"],
    "lectureHours": 16,
    "practiceHours": 8,
    "labHours": 0,
    "seminarHours": 4,
    "advisingHours": 2
  }'
```
`teacherId`, `courseId`, `academicPeriodId`, and `totalHours` are derived server-side from `courseTeacherId`.

### 3. Submit for validation
```bash
curl -X POST http://localhost:3000/api/teaching-activities/42/submit \
  -H "Authorization: Bearer <teacher-token>"
```

### 4. See your stats
```bash
curl http://localhost:3000/api/teaching-activities/stats \
  -H "Authorization: Bearer <teacher-token>"
```
Returns logged hours vs. `mandatoryHoursPerPeriod`.

## Department head: validate a submission

### 1. List submissions awaiting validation
```bash
curl http://localhost:3000/api/teaching-activities/submitted/all \
  -H "Authorization: Bearer <head-token>"
```
Scoped to the head's own department.

### 2. Validate
```bash
curl -X POST http://localhost:3000/api/teaching-activities/42/validate \
  -H "Authorization: Bearer <head-token>"
```

### 3. Or reject (frees the teacher to edit and resubmit)
```bash
curl -X POST http://localhost:3000/api/teaching-activities/42/reject \
  -H "Authorization: Bearer <head-token>" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Hours for ME-21-2 look duplicated — please verify."}'
```

## Teacher: add a publication

### 1. Create as draft
```bash
curl -X POST http://localhost:3000/api/publications \
  -H "Authorization: Bearer <teacher-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"On stress distribution in composite beams",
    "publicationType":"scopus",
    "authors":"O. Mirzakhmedov, S. Yusupov",
    "venue":"Journal of Applied Mechanics",
    "publicationDate":"2026-03-15",
    "doi":"10.1234/jam.2026.0042",
    "url":"https://doi.org/10.1234/jam.2026.0042"
  }'
```

### 2. Submit
```bash
curl -X PATCH http://localhost:3000/api/publications/7/submit \
  -H "Authorization: Bearer <teacher-token>"
```

### 3. Statistics (per teacher)
```bash
curl http://localhost:3000/api/publications/statistics \
  -H "Authorization: Bearer <teacher-token>"
```

## Scientific task — full cycle

### Head/admin: create a task
```bash
curl -X POST http://localhost:3000/api/scientific-tasks \
  -H "Authorization: Bearer <head-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "taskName":"Update LMS course materials for Spring",
    "taskDescription":"Upload syllabus, slides, and assignments to LMS for all assigned courses.",
    "deadline":"2026-04-30T23:59:59.000Z",
    "departmentId": 1
  }'
```
Omit `departmentId` (admin only) for a university-wide task.

### Teacher: upload a file, then update the report
```bash
curl -X POST http://localhost:3000/api/scientific-tasks/reports/upload \
  -H "Authorization: Bearer <teacher-token>" \
  -F "file=@./report.pdf"
# → returns { filePath, fileName }

curl -X PATCH http://localhost:3000/api/scientific-tasks/reports/15 \
  -H "Authorization: Bearer <teacher-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "completionPercentage": 80,
    "equivalentHours": 12,
    "executionStatus": "Materials uploaded, awaiting peer review",
    "filePath": "<from upload>",
    "fileName": "report.pdf"
  }'
```

### Teacher: submit; head: validate
```bash
curl -X POST http://localhost:3000/api/scientific-tasks/reports/15/submit -H "Authorization: Bearer <teacher-token>"
curl -X POST http://localhost:3000/api/scientific-tasks/reports/15/validate -H "Authorization: Bearer <head-token>"
```

## Admin: assign a teacher to a course

```bash
curl -X POST http://localhost:3000/api/course-teachers \
  -H "Authorization: Bearer <head-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": 1,
    "teacherId": 4,
    "academicPeriodId": 1,
    "groups": ["ME-21-1"]
  }'
```

## Admin: create a teacher user

```bash
curl -X POST http://localhost:3000/api/users/teachers \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "login":"teacher5",
    "password":"pass123",
    "firstName":"Aziz",
    "lastName":"Karimov",
    "email1":"a.karimov@kiut.uz",
    "phone1":"+998901112233",
    "departmentId": 1,
    "employmentType":"full-time",
    "mandatoryHoursPerPeriod": 550
  }'
```
The user is created with `mustChangePassword: true`.

## Common error shapes

```json
{ "success": false, "message": "Unauthorized", "statusCode": 401 }
{ "success": false, "message": "Validation failed", "errors": [ ... ], "statusCode": 400 }
{ "success": false, "message": "Cannot validate activity from a different department", "statusCode": 403 }
```
