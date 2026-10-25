-- Remove duplicate StudentAnswer rows (race in recordAnswer) before adding the unique constraint.
-- Keeps the newest row per (attemptId, questionId) (cuid ids sort by creation time).
DELETE FROM "StudentAnswer" a
USING "StudentAnswer" b
WHERE a."attemptId" = b."attemptId"
  AND a."questionId" = b."questionId"
  AND a.id < b.id;

-- Remove bookmarks pointing to deleted content before adding foreign keys.
DELETE FROM "Bookmark" bm
WHERE (bm."lessonId" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "Lesson" l WHERE l.id = bm."lessonId"))
   OR (bm."questionId" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "Question" q WHERE q.id = bm."questionId"));

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "trackId" TEXT;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "VerificationToken" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "isCustom" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "DailyChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "questionIds" TEXT[],
    "attemptId" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyChallenge_userId_day_key" ON "DailyChallenge"("userId", "day");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expires_idx" ON "Session"("expires");

-- CreateIndex
CREATE INDEX "VerificationToken_identifier_idx" ON "VerificationToken"("identifier");

-- CreateIndex
CREATE INDEX "Subject_systemId_gradeId_idx" ON "Subject"("systemId", "gradeId");

-- CreateIndex
CREATE INDEX "Unit_subjectId_order_idx" ON "Unit"("subjectId", "order");

-- CreateIndex
CREATE INDEX "Lesson_unitId_order_idx" ON "Lesson"("unitId", "order");

-- CreateIndex
CREATE INDEX "Question_subjectId_status_type_difficulty_idx" ON "Question"("subjectId", "status", "type", "difficulty");

-- CreateIndex
CREATE INDEX "Question_unitId_idx" ON "Question"("unitId");

-- CreateIndex
CREATE INDEX "QuestionOption_questionId_idx" ON "QuestionOption"("questionId");

-- CreateIndex
CREATE INDEX "QuestionLesson_lessonId_idx" ON "QuestionLesson"("lessonId");

-- CreateIndex
CREATE INDEX "Exam_subjectId_idx" ON "Exam"("subjectId");

-- CreateIndex
CREATE INDEX "Exam_isCustom_createdById_idx" ON "Exam"("isCustom", "createdById");

-- CreateIndex
CREATE INDEX "ExamAttempt_userId_isCompleted_completedAt_idx" ON "ExamAttempt"("userId", "isCompleted", "completedAt");

-- CreateIndex
CREATE INDEX "ExamAttempt_examId_idx" ON "ExamAttempt"("examId");

-- CreateIndex
CREATE INDEX "StudentAnswer_questionId_idx" ON "StudentAnswer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAnswer_attemptId_questionId_key" ON "StudentAnswer"("attemptId", "questionId");

-- CreateIndex
CREATE INDEX "MistakeReview_userId_isResolved_idx" ON "MistakeReview"("userId", "isResolved");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_lessonId_key" ON "Bookmark"("userId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_questionId_key" ON "Bookmark"("userId", "questionId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_resource_resourceId_idx" ON "AuditLog"("resource", "resourceId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "AcademicTrack"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyChallenge" ADD CONSTRAINT "DailyChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

