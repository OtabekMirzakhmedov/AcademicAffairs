-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_teacher_publications" (
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
    "validated_by" INTEGER,
    "rejection_reason" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "teacher_publications_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "teacher_publications_validated_by_fkey" FOREIGN KEY ("validated_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_teacher_publications" ("abstract", "authors", "created_at", "doi", "id", "isbn", "issn", "keywords", "publication_date", "publication_type", "rejection_reason", "status", "submitted_at", "teacher_id", "title", "updated_at", "url", "validated_at", "venue") SELECT "abstract", "authors", "created_at", "doi", "id", "isbn", "issn", "keywords", "publication_date", "publication_type", "rejection_reason", "status", "submitted_at", "teacher_id", "title", "updated_at", "url", "validated_at", "venue" FROM "teacher_publications";
DROP TABLE "teacher_publications";
ALTER TABLE "new_teacher_publications" RENAME TO "teacher_publications";
CREATE UNIQUE INDEX "teacher_publications_doi_key" ON "teacher_publications"("doi");
CREATE INDEX "teacher_publications_teacher_id_idx" ON "teacher_publications"("teacher_id");
CREATE INDEX "teacher_publications_publication_type_idx" ON "teacher_publications"("publication_type");
CREATE INDEX "teacher_publications_status_idx" ON "teacher_publications"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
