-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "StudyMode" AS ENUM ('ONLINE', 'OFFLINE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PENDING_VERIFICATION', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "studyMode" "StudyMode" NOT NULL DEFAULT 'ONLINE';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "centerName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "paymentReceiptUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "paymentSenderPhone" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "paymentReference" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "paymentUploadedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionExpiresAt" TIMESTAMP(3);

-- AlterTable Lesson
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "isTrial" BOOLEAN NOT NULL DEFAULT false;

-- Update existing registered students to ACTIVE subscription by default so we preserve existing users
UPDATE "User" SET "subscriptionStatus" = 'ACTIVE' WHERE "role" = 'STUDENT' AND "subscriptionStatus" = 'TRIAL';

