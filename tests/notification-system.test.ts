import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { NotificationService } from "@/services/notification.service";
import { NotificationType } from "@prisma/client";

describe("Notification System & Announcements Tests", () => {
  let studentUser: { id: string; gradeId: string | null; schoolCategory: "ARABIC" | "LANGUAGES" };
  let gradeId: string;
  const createdAnnouncementIds: string[] = [];

  beforeAll(async () => {
    // Find or create test grade
    const grade = await prisma.grade.findFirst();
    gradeId = grade ? grade.id : "test_grade_1";

    // Create a student user for notification testing
    const user = await prisma.user.create({
      data: {
        email: `notif_test_${Date.now()}@test.com`,
        name: "طالب تجربة الإشعارات",
        role: "STUDENT",
        gradeId,
        schoolCategory: "ARABIC",
      },
    });
    studentUser = { id: user.id, gradeId: user.gradeId, schoolCategory: user.schoolCategory };
  });

  afterAll(async () => {
    if (createdAnnouncementIds.length > 0) {
      await prisma.notificationRead.deleteMany({
        where: { announcementId: { in: createdAnnouncementIds } },
      });
      await prisma.announcement.deleteMany({
        where: { id: { in: createdAnnouncementIds } },
      });
    }

    if (studentUser?.id) {
      await prisma.pushSubscription.deleteMany({ where: { userId: studentUser.id } });
      await prisma.user.delete({ where: { id: studentUser.id } }).catch(() => {});
    }
  });

  it("generates live smart notifications (daily gatekeeper exam) for new students", async () => {
    const result = await NotificationService.getInAppNotifications(studentUser.id);
    expect(result).toBeDefined();
    expect(result.unreadCount).toBeGreaterThan(0);

    const dailyNotif = result.notifications.find((n) => n.type === "DAILY_EXAM");
    expect(dailyNotif).toBeDefined();
    expect(dailyNotif?.isUrgent).toBe(true);
    expect(dailyNotif?.link).toBe("/dashboard");
  });

  it("creates an admin announcement and includes it in targeted student feed", async () => {
    const ann = await NotificationService.createAnnouncement({
      title: "تنبيه هام لاختبارات الشهر",
      message: "يرجى مراجعة نماذج الامتحانات التدريبية الجديدة في أقرب وقت.",
      type: NotificationType.ANNOUNCEMENT,
      targetGradeId: gradeId,
      targetSchoolCategory: "ARABIC",
      link: "/exams",
      isUrgent: true,
      sendPush: false,
    });
    createdAnnouncementIds.push(ann.id);

    expect(ann.id).toBeDefined();
    expect(ann.title).toBe("تنبيه هام لاختبارات الشهر");

    // Fetch student notifications
    const feed = await NotificationService.getInAppNotifications(studentUser.id);
    const found = feed.notifications.find((n) => n.id === ann.id);

    expect(found).toBeDefined();
    expect(found?.title).toBe("تنبيه هام لاختبارات الشهر");
    expect(found?.isUrgent).toBe(true);
    expect(found?.isRead).toBe(false);
  });

  it("filters announcements properly so languages-only announcements do not leak to arabic students", async () => {
    const languagesAnn = await NotificationService.createAnnouncement({
      title: "Languages School Update",
      message: "Physics and Chemistry worksheets updated for Languages track.",
      type: NotificationType.COURSE_UPDATE,
      targetGradeId: gradeId,
      targetSchoolCategory: "LANGUAGES", // Student is ARABIC
      sendPush: false,
    });
    createdAnnouncementIds.push(languagesAnn.id);

    const feed = await NotificationService.getInAppNotifications(studentUser.id);
    const leak = feed.notifications.find((n) => n.id === languagesAnn.id);
    expect(leak).toBeUndefined();
  });

  it("marks a persistent announcement as read and updates unread count", async () => {
    const ann = await NotificationService.createAnnouncement({
      title: "إشعار للتجربة الفردية",
      message: "اختبار القراءة والتفاعل الفردي",
      targetGradeId: null, // Broadcast to all
      sendPush: false,
    });
    createdAnnouncementIds.push(ann.id);

    // Initial check
    const beforeFeed = await NotificationService.getInAppNotifications(studentUser.id);
    const beforeItem = beforeFeed.notifications.find((n) => n.id === ann.id);
    expect(beforeItem?.isRead).toBe(false);

    // Mark as read
    const success = await NotificationService.markAsRead(studentUser.id, ann.id);
    expect(success).toBe(true);

    // After check
    const afterFeed = await NotificationService.getInAppNotifications(studentUser.id);
    const afterItem = afterFeed.notifications.find((n) => n.id === ann.id);
    expect(afterItem?.isRead).toBe(true);
  });

  it("marks all active announcements as read simultaneously", async () => {
    const ann1 = await NotificationService.createAnnouncement({
      title: "إشعار جماعي 1",
      message: "محتوى 1",
      sendPush: false,
    });
    const ann2 = await NotificationService.createAnnouncement({
      title: "إشعار جماعي 2",
      message: "محتوى 2",
      sendPush: false,
    });
    createdAnnouncementIds.push(ann1.id, ann2.id);

    const count = await NotificationService.markAllAsRead(studentUser.id);
    expect(count).toBeGreaterThanOrEqual(2);

    const feed = await NotificationService.getInAppNotifications(studentUser.id);
    const item1 = feed.notifications.find((n) => n.id === ann1.id);
    const item2 = feed.notifications.find((n) => n.id === ann2.id);

    expect(item1?.isRead).toBe(true);
    expect(item2?.isRead).toBe(true);
  });

  it("saves and manages browser Web Push subscriptions", async () => {
    const dummyEndpoint = `https://fcm.googleapis.com/fcm/send/test_${Date.now()}`;
    const dummySub = {
      endpoint: dummyEndpoint,
      keys: {
        p256dh: "BMhL7Gq8y_dummy_p256dh_key_data",
        auth: "dummy_auth_secret",
      },
    };

    // Save subscription
    const saved = await NotificationService.savePushSubscription(
      studentUser.id,
      dummySub,
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    );
    expect(saved.id).toBeDefined();
    expect(saved.endpoint).toBe(dummyEndpoint);

    // Upsert works without duplicate key error
    const upserted = await NotificationService.savePushSubscription(studentUser.id, dummySub);
    expect(upserted.id).toBe(saved.id);

    // Remove subscription
    await NotificationService.removePushSubscription(dummyEndpoint);
    const inDb = await prisma.pushSubscription.findUnique({ where: { endpoint: dummyEndpoint } });
    expect(inDb).toBeNull();
  });
});
