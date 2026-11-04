-- AlterTable Question
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "translation" TEXT;

-- AlterTable QuestionOption
ALTER TABLE "QuestionOption" ADD COLUMN IF NOT EXISTS "translation" TEXT;

-- AlterTable EssayRubric
ALTER TABLE "EssayRubric" ADD COLUMN IF NOT EXISTS "modelAnswerTranslation" TEXT;

