-- CreateTable
CREATE TABLE "programs" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "degree_level" TEXT NOT NULL,
    "department_id" INTEGER NOT NULL,
    "duration_years" INTEGER NOT NULL,
    "total_credits_required" DECIMAL(6,2) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_courses" (
    "id" SERIAL NOT NULL,
    "program_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "recommended_semester" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_courses_pkey" PRIMARY KEY ("id")
);

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

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_courses" ADD CONSTRAINT "program_courses_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_courses" ADD CONSTRAINT "program_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
