-- Additive non-breaking migration for common subjects across school categories,
-- under-construction state, dedicated Arabic learning engine, content versioning,
-- per-section student progress, and question provenance tracking.

DO $$ BEGIN
  CREATE TYPE "QuestionOrigin" AS ENUM (
    'OFFICIAL_TEXTBOOK',
    'OFFICIAL_TEXTBOOK_ADAPTED',
    'OFFICIAL_CLASSROOM_ASSESSMENT',
    'OFFICIAL_HOME_ASSESSMENT',
    'OFFICIAL_WEEKLY_ASSESSMENT',
    'OFFICIAL_ASSESSMENTS_ADAPTED',
    'KHOLASA_ORIGINAL'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "Subject" ADD COLUMN IF NOT EXISTS "isCommonCategory" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Subject" ADD COLUMN IF NOT EXISTS "isUnderConstruction" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Subject" ADD COLUMN IF NOT EXISTS "learningEngine" TEXT NOT NULL DEFAULT 'STANDARD';

ALTER TABLE "LessonContent" ADD COLUMN IF NOT EXISTS "structuredData" JSONB;

ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "externalKey" TEXT;
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "origin" "QuestionOrigin";
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "skillCategory" TEXT;
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "sourceReferences" JSONB;

ALTER TABLE "QuestionExplanation" ADD COLUMN IF NOT EXISTS "examTrick" TEXT;
ALTER TABLE "QuestionExplanation" ADD COLUMN IF NOT EXISTS "origin" TEXT;

CREATE TABLE IF NOT EXISTS "LessonContentVersion" (
  "id" TEXT NOT NULL,
  "lessonId" TEXT NOT NULL,
  "versionNumber" INTEGER NOT NULL,
  "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
  "body" TEXT NOT NULL,
  "objectives" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "structuredData" JSONB NOT NULL,
  "validationReport" JSONB,
  "notes" TEXT,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "publishedAt" TIMESTAMP(3),
  CONSTRAINT "LessonContentVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "StudentSectionProgress" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "lessonId" TEXT NOT NULL,
  "sectionAnchorId" TEXT NOT NULL,
  "stageId" TEXT NOT NULL,
  "isCompleted" BOOLEAN NOT NULL DEFAULT false,
  "lastVisitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "state" JSONB,
  CONSTRAINT "StudentSectionProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Question_subjectId_externalKey_key" ON "Question"("subjectId", "externalKey");
CREATE INDEX IF NOT EXISTS "Question_subjectId_origin_idx" ON "Question"("subjectId", "origin");

CREATE UNIQUE INDEX IF NOT EXISTS "LessonContentVersion_lessonId_versionNumber_key" ON "LessonContentVersion"("lessonId", "versionNumber");
CREATE INDEX IF NOT EXISTS "LessonContentVersion_lessonId_status_idx" ON "LessonContentVersion"("lessonId", "status");

CREATE UNIQUE INDEX IF NOT EXISTS "StudentSectionProgress_userId_lessonId_sectionAnchorId_key" ON "StudentSectionProgress"("userId", "lessonId", "sectionAnchorId");
CREATE INDEX IF NOT EXISTS "StudentSectionProgress_userId_lessonId_idx" ON "StudentSectionProgress"("userId", "lessonId");

DO $$ BEGIN
  ALTER TABLE "LessonContentVersion" ADD CONSTRAINT "LessonContentVersion_lessonId_fkey"
    FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "LessonContentVersion" ADD CONSTRAINT "LessonContentVersion_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "StudentSectionProgress" ADD CONSTRAINT "StudentSectionProgress_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "StudentSectionProgress" ADD CONSTRAINT "StudentSectionProgress_lessonId_fkey"
    FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
