-- CreateTable
CREATE TABLE "roles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "must_change_password" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_info" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email_1" TEXT,
    "email_2" TEXT,
    "phone_1" TEXT,
    "phone_2" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "user_info_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "academic_periods" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "academic_year" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "teaching_week" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "departments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "head_id" INTEGER,
    "phone" TEXT,
    "room_number" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "departments_head_id_fkey" FOREIGN KEY ("head_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "teacher_info" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "employment_type" TEXT,
    "department_id" INTEGER NOT NULL,
    "mandatory_hours_per_period" DECIMAL,
    "mandatory_extracurricular_hours" DECIMAL DEFAULT 0,
    "mandatory_conference_articles" INTEGER DEFAULT 0,
    "mandatory_national_articles" INTEGER DEFAULT 0,
    "mandatory_scopus_articles" INTEGER DEFAULT 0,
    "mandatory_documentation" INTEGER DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "teacher_info_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "teacher_info_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "courses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "department_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "courses_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "course_teachers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "course_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "academic_period_id" INTEGER NOT NULL,
    "groups" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "course_teachers_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "course_teachers_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "course_teachers_academic_period_id_fkey" FOREIGN KEY ("academic_period_id") REFERENCES "academic_periods" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "teaching_activities" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "course_teacher_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "academic_period_id" INTEGER NOT NULL,
    "groups" JSONB NOT NULL,
    "lecture_hours" DECIMAL NOT NULL DEFAULT 0,
    "practice_hours" DECIMAL NOT NULL DEFAULT 0,
    "lab_hours" DECIMAL NOT NULL DEFAULT 0,
    "seminar_hours" DECIMAL NOT NULL DEFAULT 0,
    "advising_hours" DECIMAL NOT NULL DEFAULT 0,
    "total_hours" DECIMAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "submitted_at" DATETIME,
    "validated_at" DATETIME,
    "validated_by" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "teaching_activities_course_teacher_id_fkey" FOREIGN KEY ("course_teacher_id") REFERENCES "course_teachers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "teaching_activities_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "teaching_activities_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "teaching_activities_academic_period_id_fkey" FOREIGN KEY ("academic_period_id") REFERENCES "academic_periods" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "teaching_activities_validated_by_fkey" FOREIGN KEY ("validated_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "programs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "degree_level" TEXT NOT NULL,
    "department_id" INTEGER NOT NULL,
    "duration_years" INTEGER NOT NULL,
    "total_credits_required" DECIMAL NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "programs_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "programs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "program_courses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "program_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "recommended_semester" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "program_courses_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "program_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "scientific_tasks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "task_name" TEXT NOT NULL,
    "task_description" TEXT,
    "deadline" DATETIME NOT NULL,
    "created_by" INTEGER NOT NULL,
    "department_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "scientific_tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "scientific_tasks_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "teacher_scientific_reports" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scientific_task_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "execution_status" TEXT,
    "completion_percentage" INTEGER NOT NULL DEFAULT 0,
    "equivalent_hours" DECIMAL NOT NULL DEFAULT 0,
    "file_path" TEXT,
    "file_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "submitted_at" DATETIME,
    "validated_at" DATETIME,
    "validated_by" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "teacher_scientific_reports_scientific_task_id_fkey" FOREIGN KEY ("scientific_task_id") REFERENCES "scientific_tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "teacher_scientific_reports_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "teacher_scientific_reports_validated_by_fkey" FOREIGN KEY ("validated_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "teacher_publications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teacher_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "publication_type" TEXT NOT NULL,
    "authors" TEXT NOT NULL,
    "venue" TEXT,
    "publication_date" DATETIME,
    "doi" TEXT,
    "isbn" TEXT,
    "issn" TEXT,
    "url" TEXT,
    "abstract" TEXT,
    "keywords" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "submitted_at" DATETIME,
    "validated_at" DATETIME,
    "rejection_reason" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "teacher_publications_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_login_key" ON "users"("login");

-- CreateIndex
CREATE UNIQUE INDEX "user_info_user_id_key" ON "user_info"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_info_user_id_key" ON "teacher_info"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "programs_code_key" ON "programs"("code");

-- CreateIndex
CREATE INDEX "programs_department_id_idx" ON "programs"("department_id");

-- CreateIndex
CREATE INDEX "programs_degree_level_idx" ON "programs"("degree_level");

-- CreateIndex
CREATE INDEX "programs_is_active_idx" ON "programs"("is_active");

-- CreateIndex
CREATE INDEX "program_courses_program_id_idx" ON "program_courses"("program_id");

-- CreateIndex
CREATE INDEX "program_courses_course_id_idx" ON "program_courses"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "program_courses_program_id_course_id_key" ON "program_courses"("program_id", "course_id");

-- CreateIndex
CREATE INDEX "scientific_tasks_created_by_idx" ON "scientific_tasks"("created_by");

-- CreateIndex
CREATE INDEX "scientific_tasks_department_id_idx" ON "scientific_tasks"("department_id");

-- CreateIndex
CREATE INDEX "scientific_tasks_is_active_idx" ON "scientific_tasks"("is_active");

-- CreateIndex
CREATE INDEX "teacher_scientific_reports_scientific_task_id_idx" ON "teacher_scientific_reports"("scientific_task_id");

-- CreateIndex
CREATE INDEX "teacher_scientific_reports_teacher_id_idx" ON "teacher_scientific_reports"("teacher_id");

-- CreateIndex
CREATE INDEX "teacher_scientific_reports_status_idx" ON "teacher_scientific_reports"("status");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_scientific_reports_scientific_task_id_teacher_id_key" ON "teacher_scientific_reports"("scientific_task_id", "teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_publications_doi_key" ON "teacher_publications"("doi");

-- CreateIndex
CREATE INDEX "teacher_publications_teacher_id_idx" ON "teacher_publications"("teacher_id");

-- CreateIndex
CREATE INDEX "teacher_publications_publication_type_idx" ON "teacher_publications"("publication_type");

-- CreateIndex
CREATE INDEX "teacher_publications_status_idx" ON "teacher_publications"("status");
