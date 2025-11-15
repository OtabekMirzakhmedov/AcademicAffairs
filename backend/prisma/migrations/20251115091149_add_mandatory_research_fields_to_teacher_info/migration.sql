-- AlterTable
ALTER TABLE "teacher_info" ADD COLUMN     "mandatory_conference_articles" INTEGER DEFAULT 0,
ADD COLUMN     "mandatory_documentation" INTEGER DEFAULT 0,
ADD COLUMN     "mandatory_extracurricular_hours" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "mandatory_national_articles" INTEGER DEFAULT 0,
ADD COLUMN     "mandatory_scopus_articles" INTEGER DEFAULT 0;
