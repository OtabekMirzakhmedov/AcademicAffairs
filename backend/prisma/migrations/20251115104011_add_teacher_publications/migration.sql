-- CreateTable
CREATE TABLE "teacher_publications" (
    "id" SERIAL NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "publication_type" TEXT NOT NULL,
    "authors" TEXT NOT NULL,
    "venue" TEXT,
    "publication_date" TIMESTAMP(3),
    "doi" TEXT,
    "isbn" TEXT,
    "issn" TEXT,
    "url" TEXT,
    "abstract" TEXT,
    "keywords" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "submitted_at" TIMESTAMP(3),
    "validated_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_publications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teacher_publications_doi_key" ON "teacher_publications"("doi");

-- CreateIndex
CREATE INDEX "teacher_publications_teacher_id_idx" ON "teacher_publications"("teacher_id");

-- CreateIndex
CREATE INDEX "teacher_publications_publication_type_idx" ON "teacher_publications"("publication_type");

-- CreateIndex
CREATE INDEX "teacher_publications_status_idx" ON "teacher_publications"("status");

-- AddForeignKey
ALTER TABLE "teacher_publications" ADD CONSTRAINT "teacher_publications_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
