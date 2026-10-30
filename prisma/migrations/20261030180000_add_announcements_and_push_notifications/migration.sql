-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ANNOUNCEMENT', 'SYSTEM', 'DAILY_EXAM', 'MISTAKE_REMINDER', 'COURSE_UPDATE');

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'ANNOUNCEMENT',
    "targetGradeId" TEXT,
    "targetSchoolCategory" "SchoolCategory",
    "link" TEXT,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationRead" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Announcement_createdAt_idx" ON "Announcement"("createdAt");

-- CreateIndex
CREATE INDEX "Announcement_targetGradeId_targetSchoolCategory_idx" ON "Announcement"("targetGradeId", "targetSchoolCategory");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationRead_userId_announcementId_key" ON "NotificationRead"("userId", "announcementId");

-- CreateIndex
CREATE INDEX "NotificationRead_userId_idx" ON "NotificationRead"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationRead" ADD CONSTRAINT "NotificationRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationRead" ADD CONSTRAINT "NotificationRead_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
