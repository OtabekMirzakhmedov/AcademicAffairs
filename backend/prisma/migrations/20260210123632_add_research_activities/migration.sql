-- CreateTable
CREATE TABLE "research_activity_templates" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "max_amount" REAL,
    "penalty" REAL,
    "category" TEXT NOT NULL DEFAULT 'scientific_main',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "teacher_research_activities" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teacher_id" INTEGER NOT NULL,
    "template_id" INTEGER NOT NULL,
    "completion_percentage" INTEGER NOT NULL DEFAULT 0,
    "file_path" TEXT,
    "file_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "deadline" DATETIME,
    "submitted_at" DATETIME,
    "validated_at" DATETIME,
    "validated_by" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "teacher_research_activities_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "teacher_research_activities_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "research_activity_templates" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "teacher_research_activities_validated_by_fkey" FOREIGN KEY ("validated_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "teacher_research_activities_teacher_id_idx" ON "teacher_research_activities"("teacher_id");

-- CreateIndex
CREATE INDEX "teacher_research_activities_template_id_idx" ON "teacher_research_activities"("template_id");

-- CreateIndex
CREATE INDEX "teacher_research_activities_status_idx" ON "teacher_research_activities"("status");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_research_activities_teacher_id_template_id_key" ON "teacher_research_activities"("teacher_id", "template_id");
