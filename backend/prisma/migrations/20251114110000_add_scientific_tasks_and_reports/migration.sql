-- CreateTable
CREATE TABLE "scientific_tasks" (
    "id" SERIAL NOT NULL,
    "task_name" TEXT NOT NULL,
    "task_description" TEXT,
    "deadline" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "department_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scientific_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_scientific_reports" (
    "id" SERIAL NOT NULL,
    "scientific_task_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "execution_status" TEXT,
    "completion_percentage" INTEGER NOT NULL DEFAULT 0,
    "file_path" TEXT,
    "file_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "submitted_at" TIMESTAMP(3),
    "validated_at" TIMESTAMP(3),
    "validated_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_scientific_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scientific_tasks_created_by_idx" ON "scientific_tasks"("created_by");

-- CreateIndex
CREATE INDEX "scientific_tasks_department_id_idx" ON "scientific_tasks"("department_id");

-- CreateIndex
CREATE INDEX "scientific_tasks_is_active_idx" ON "scientific_tasks"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_scientific_reports_scientific_task_id_teacher_id_key" ON "teacher_scientific_reports"("scientific_task_id", "teacher_id");

-- CreateIndex
CREATE INDEX "teacher_scientific_reports_scientific_task_id_idx" ON "teacher_scientific_reports"("scientific_task_id");

-- CreateIndex
CREATE INDEX "teacher_scientific_reports_teacher_id_idx" ON "teacher_scientific_reports"("teacher_id");

-- CreateIndex
CREATE INDEX "teacher_scientific_reports_status_idx" ON "teacher_scientific_reports"("status");

-- AddForeignKey
ALTER TABLE "scientific_tasks" ADD CONSTRAINT "scientific_tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scientific_tasks" ADD CONSTRAINT "scientific_tasks_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_scientific_reports" ADD CONSTRAINT "teacher_scientific_reports_scientific_task_id_fkey" FOREIGN KEY ("scientific_task_id") REFERENCES "scientific_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_scientific_reports" ADD CONSTRAINT "teacher_scientific_reports_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_scientific_reports" ADD CONSTRAINT "teacher_scientific_reports_validated_by_fkey" FOREIGN KEY ("validated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
