# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

Academic Affairs is a full-stack monorepo for managing university academic operations: teaching activities, course management, workload tracking, research activities, and publications. Three user roles: **Admin**, **Department Head**, **Teacher**. Target deployment: KIUT (Uzbekistan); UI is English-only today, multi-language is on the roadmap.

## Where to look first

Before touching code, scan the doc that covers your task:

- **Domain terms** (roles, status values, hour types, mandatory quotas, employment types, VAK, etc.) → `docs/glossary.md`. Read this first when a field name is ambiguous (`status` means different things on different entities; `executionStatus` ≠ `status`).
- **State machines** (who can transition draft → submitted → validated/rejected, per entity) → `docs/workflows.md`.
- **API recipes** (curl examples for login, log hours, submit, validate, publication flow, etc.) → `docs/api-examples.md`.
- **Seed data** (logins, passwords, ids of seeded users / departments / courses) → `docs/seed-data.md`.
- **Per-module specifics** (purpose, endpoints, gotchas) → `backend/src/modules/<module>/README.md`.
- **Live API reference** → Swagger at `http://localhost:3000/api/docs`.
- **Planned (not yet built)**:
  - `docs/audit-logging-plan.md` — audit log + Pino structured logging design.
  - `docs/i18n-plan.md` — i18n (uz-Latn default, ru, en) via react-i18next.

## Commands

### Backend (from `/backend`)
```bash
npm run start:dev          # Development with hot reload
npm run build              # Production build
npm run start:prod         # Run production (node dist/src/main)
npm run lint               # ESLint with auto-fix
npm run format             # Prettier formatting
npm test                   # Jest unit tests
npm run test:watch         # Watch mode
npm run test:e2e           # End-to-end tests
npm run test:cov           # Coverage report
```

### Frontend (from `/frontend`)
```bash
npm run dev                # Vite dev server (port 5173)
npm run build              # TypeScript check + Vite build
npm run lint               # ESLint
npm run preview            # Preview production build
```

### Start app in the in-app browser
1. Make sure the backend is running at `http://localhost:3000`:
   - From `/backend`: `npm run start:dev`
   - Confirm with Swagger: `http://localhost:3000/api/docs`
2. Start the frontend at `http://localhost:5173`:
   - Normal path from `/frontend`: `npm run dev`
   - If the Windows shell has the duplicated `Path`/`PATH` issue or `npm` launch is flaky, use Node directly:
     ```bash
     "C:\Program Files\nodejs\node.exe" "node_modules\vite\bin\vite.js" --host 127.0.0.1
     ```
3. Open the app in the Codex in-app browser at `http://localhost:5173`.
4. If inspecting protected pages, use seeded credentials from `docs/seed-data.md`; the fallback admin login is `admin` / `admin123`.
5. Local note: this machine has shown a Vite warning with Node `20.18.2`; Vite `7.x` prefers Node `20.19+` or `22.12+`. The app may still run, but upgrading Node will make startup less brittle.

### Database (from `/backend`)
```bash
npx prisma generate        # Regenerate client after schema changes
npx prisma migrate dev --name <name>  # Create migration
npx prisma migrate deploy  # Apply migrations (production)
npx prisma db seed         # Seed database (requires build first)
npx prisma studio          # Database GUI (port 5555)
npx prisma migrate reset   # Reset database (destructive)
```

Note: Seeding runs `node dist/prisma/seed.js`, so run `npm run build` first.

## Architecture

### Stack
- **Backend**: NestJS 11 + Fastify adapter + Prisma ORM + SQLite (PostgreSQL-ready)
- **Frontend**: React 18 + TypeScript + Vite + Zustand + Ant Design + Tailwind CSS
- **Auth**: JWT access tokens (30min) + refresh tokens (7d/30d with remember-me)

### Backend Structure (`/backend/src`)
```
modules/
├── auth/              # JWT strategy, guards, login/refresh/change-password
├── users/             # User CRUD
├── departments/       # Department management
├── courses/           # Course CRUD
├── course-teachers/   # Teacher-course assignments per academic period
├── academic-periods/  # Semester configuration
├── teaching-activities/  # Hours tracking (lecture/practice/lab/seminar/advising)
├── scientific-tasks/  # Task assignments with deadlines
├── publications/      # Conference/national/Scopus publications
├── research-activities/  # Research activity templates and tracking
└── programs/          # Academic degree programs
prisma/
└── prisma.service.ts  # Database connection singleton
```

Each module follows: Controller → Service → Prisma pattern with dependency injection.

### Frontend Structure (`/frontend/src`)
```
components/
├── common/            # ProtectedRoute, RoleBasedRedirect
├── layout/            # MainLayout (sidebar navigation)
└── features/          # Feature-specific modals and forms
pages/                 # Route pages organized by role
store/                 # Zustand stores (authStore)
services/              # API service classes (one per module)
config/                # api.ts (axios instance), branding.json
types/                 # TypeScript interfaces
```

### Key Patterns

**Authentication Flow**:
1. Login returns access + refresh tokens stored in localStorage
2. Axios interceptor attaches Bearer token to all requests
3. On 401, interceptor attempts token refresh; failure triggers logout
4. `ProtectedRoute` component guards routes, `RoleBasedRedirect` routes by role

**Activity Status Workflow**: `draft` → `submitted` → `validated`/`rejected`

**API Response Format**:
```json
{ "success": true, "data": {...}, "message": "..." }
```

All API endpoints prefixed with `/api`.

**Swagger/OpenAPI Documentation**:
- Available at `http://localhost:3000/api/docs` when backend is running
- All endpoints documented with `@nestjs/swagger` decorators
- Supports JWT Bearer authentication via "Authorize" button
- DTOs include example values and validation descriptions

### Database Schema (Prisma)

Core models and relationships:
- `User` → `Role` (admin/departmenthead/teacher)
- `User` → `UserInfo` (personal details) → `TeacherInfo` (employment, degrees, awards)
- `Department` → `Course` → `CourseTeacher` (per academic period)
- `TeachingActivity` tracks hours by type with validation workflow
- `ScientificTask` → `TeacherScientificReport` for task completion tracking
- `TeacherPublication` for publication management
- `ResearchActivityTemplate` → `TeacherResearchActivity` for research tracking

## Environment Variables

### Backend (`/backend/.env`)
```
DATABASE_URL="file:./dev.db"    # SQLite path or PostgreSQL URL
JWT_SECRET=<secret>
JWT_EXPIRES_IN=30m
JWT_REFRESH_SECRET=<secret>
JWT_REFRESH_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN_REMEMBER_ME=30d
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173  # For CORS
```

### Frontend (`/frontend/.env`)
```
VITE_API_URL=http://localhost:3000/api
```

## Default Credentials

After seeding: `admin` / `admin123` (forces password change on first login)

## Deployment

Uses `render.yaml` for Render.com Blueprint deployment:
- Backend: Node.js web service with SQLite on persistent disk
- Frontend: Static site from `frontend/dist`
- Auto-generates JWT secrets; manually configure CORS URLs post-deploy

## Naming conventions

These are not always consistent in the current codebase — when in doubt, follow the rules below over existing code.

- **Hour fields on `TeachingActivity`** use the form `<type>Hours`: `lectureHours`, `practiceHours`, `labHours`, `seminarHours`, `advisingHours`, `totalHours`. New hour types must follow this pattern.
- **Mandatory quotas on `TeacherInfo`** use the prefix `mandatory`: `mandatoryHoursPerPeriod`, `mandatoryConferenceArticles`, etc.
- **Status fields:** workflow state is always `status`. If an entity needs an independent narrative status (like `TeacherScientificReport.executionStatus`), use a distinct name — never reuse `status`.
- **Foreign keys** are camelCase in Prisma models (`teacherId`) and snake_case in the DB (`@map("teacher_id")`).
- **Endpoints**: kebab-case resource names (`/course-teachers`, `/scientific-tasks`), plural. Sub-resources use nested paths (`/scientific-tasks/reports/:id`).
- **Workflow transition endpoints** are `POST /<resource>/:id/<verb>` where verb is `submit`, `validate`, `reject` (publications module currently uses `PATCH` for some of these — new modules should follow the `POST` convention).
- **DTOs**: `Create<Entity>Dto`, `Update<Entity>Dto`. Validation via class-validator decorators. Swagger examples on every field where the type isn't self-evident.
- **Frontend services**: one class per backend module, named `<Module>Service` in `frontend/src/services/`. Each method returns the unwrapped `data` (not the `{ success, data, message }` envelope).

## How to add a new ...

### ... teaching hour type (e.g. `internshipHours`)
1. Add the column to `TeachingActivity` in `backend/prisma/schema.prisma` (Decimal, default 0, `@map(...)`).
2. `npx prisma migrate dev --name add_internship_hours`.
3. Include it in the `totalHours` computation in `teaching-activities.service.ts`.
4. Add to the DTOs (`create-teaching-activity.dto.ts`, `update-...`).
5. Frontend: add the field to the form modal and the type in `frontend/src/types/`.
6. Update `docs/glossary.md` → "Teaching Hour Types".

### ... role (beyond admin/head/teacher)
This is invasive; expect to touch:
1. Seed the role row in `prisma/seed.ts`.
2. Add role-specific data (if any) — typically a new table mirroring `TeacherInfo`.
3. `RolesGuard` / `@Roles(...)` decorators on all controllers that should expose endpoints to the new role.
4. Frontend `RoleBasedRedirect` and route guards in `router.tsx`.
5. Sidebar items in `MainLayout`.
6. Update `docs/glossary.md` and `docs/workflows.md` if the new role participates in validation.

### ... entity with the draft→submitted→validated workflow
1. Prisma model with: `status` (default initial), `submittedAt`, `validatedAt`, `validatedBy`, plus a rejection reason field.
2. NestJS module (`nest g resource`) with: create (initial status), update (only when editable), `POST :id/submit`, `POST :id/validate`, `POST :id/reject`, `GET submitted/all` (for the head's inbox).
3. Apply `JwtAuthGuard` + `RolesGuard` with `@Roles(...)` per endpoint per the matrix in `docs/workflows.md`.
4. Enforce department scoping in the service (heads only see/validate their own department's data).
5. Add the entity to `docs/workflows.md` and a per-module README.
6. Frontend service + page + modal mirroring the existing teaching-activities flow.

### ... report or export
There is no reporting module yet. When adding one:
1. Put aggregation logic in the relevant module's service (`getDepartmentSummary`, etc.) rather than client-side.
2. Use a dedicated controller path like `GET /<resource>/reports/<name>` to keep them grouped.
3. For Excel/PDF, add an `accept` query param or a separate `/<...>/export` endpoint. Pick one convention and document it here before writing the second one.

## When you change something documented

If you change a field name, status vocabulary, endpoint path, or workflow:
1. Update `docs/glossary.md` if it's a domain term.
2. Update `docs/workflows.md` if it's a transition or endpoint name.
3. Update the relevant per-module README under `backend/src/modules/<module>/README.md`.
4. Update `docs/api-examples.md` if a curl example breaks.

Stale docs are worse than no docs for AI sessions — they actively mislead.
