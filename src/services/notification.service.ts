import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { NotificationType, SchoolCategory } from "@prisma/client";

export interface InAppNotification {
  id: string;
  type:
    | "DAILY_EXAM"
    | "MISTAKES"
    | "PROGRESS"
    | "SYSTEM"
    | "ANNOUNCEMENT"
    | "COURSE_UPDATE"
    | "MISTAKE_REMINDER";
  title: string;
  message: string;
  link: string;
  createdAt: Date;
  isUrgent?: boolean;
  isRead?: boolean;
  isPersisted?: boolean;
}

export type InAppNotificationList = InAppNotification[] & {
  notifications: InAppNotification[];
  unreadCount: number;
};

// Built-in VAPID configuration with environment variable override
const DEFAULT_VAPID_PUBLIC =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BLBJorfINYPUANQaIyC72NprG5_RuteE9WsVxhQMIBpmPp3UbP5CxA-c05R50fknjbiZW1ypWwgOVktwxmnf-88";

const DEFAULT_VAPID_PRIVATE =
  process.env.VAPID_PRIVATE_KEY ||
  "h-uK4rt_9bTvWFsiBvXBcvsTbCdWzpphJ4AE_TCnaaY";

const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:support@el-kholasa.online";

try {
  webpush.setVapidDetails(VAPID_SUBJECT, DEFAULT_VAPID_PUBLIC, DEFAULT_VAPID_PRIVATE);
} catch (err) {
  console.warn("VAPID initialization notice:", err);
}

export class NotificationService {
  /**
   * Return the public VAPID key for client service worker subscription
   */
  static getPublicKey(): string {
    return DEFAULT_VAPID_PUBLIC;
  }

  /**
   * Generate both live smart notifications and persistent database announcements for a student
   */
  static async getInAppNotifications(userId: string): Promise<InAppNotificationList> {
    const notifications: InAppNotification[] = [];

    // Fetch student's grade and track/category for targeted announcements
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, gradeId: true, schoolCategory: true },
    });

    const now = new Date();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 1. Live Academic Check: Daily gatekeeper challenge
    const todayAttempt = await prisma.examAttempt.findFirst({
      where: {
        userId,
        startedAt: { gte: startOfToday },
        isCompleted: true,
      },
    });

    if (!todayAttempt) {
      notifications.push({
        id: `daily_${startOfToday.toISOString().slice(0, 10)}`,
        type: "DAILY_EXAM",
        title: "سؤال النهاردة مستنيك!",
        message: "ابدأ يومك بسؤال سريع وسجّل حضورك اليومي للحفاظ على استمرارك وصدارتك.",
        link: "/dashboard",
        createdAt: new Date(),
        isUrgent: true,
        isRead: false,
        isPersisted: false,
      });
    }

    // 2. Live Academic Check: Unresolved mistakes
    const unresolvedMistakesCount = await prisma.mistakeReview.count({
      where: { userId, isResolved: false },
    });

    if (unresolvedMistakesCount > 0) {
      notifications.push({
        id: `mistakes_${unresolvedMistakesCount}`,
        type: "MISTAKES",
        title: "ركن «غلطاتي» يحتاج مراجعة",
        message: `لديك ${unresolvedMistakesCount} أسئلة غير متقنة. حوّل نقاط ضعفك إلى قوة وراجعها الآن!`,
        link: "/mistakes",
        createdAt: new Date(),
        isUrgent: false,
        isRead: false,
        isPersisted: false,
      });
    }

    // 3. Live Academic Check: In-progress unfinished lessons
    const inProgressLesson = await prisma.studentProgress.findFirst({
      where: {
        userId,
        isCompleted: false,
        progressPercent: { gt: 0, lt: 90 },
      },
      orderBy: { lastAccessedAt: "desc" },
      include: {
        lesson: { select: { id: true, title: true } },
      },
    });

    if (inProgressLesson) {
      notifications.push({
        id: `lesson_${inProgressLesson.lessonId}`,
        type: "PROGRESS",
        title: "تابع مذاكرتك",
        message: `أنت في منتصف درس «${inProgressLesson.lesson.title}» (${inProgressLesson.progressPercent}%). أكمل ما بدأته!`,
        link: `/lessons/${inProgressLesson.lessonId}`,
        createdAt: inProgressLesson.lastAccessedAt,
        isUrgent: false,
        isRead: false,
        isPersisted: false,
      });
    }

    // 4. Persistent Admin Broadcast Announcements from Database
    const announcements = await prisma.announcement.findMany({
      where: {
        AND: [
          {
            OR: [
              { targetGradeId: null },
              ...(user?.gradeId ? [{ targetGradeId: user.gradeId }] : []),
            ],
          },
          {
            OR: [
              { targetSchoolCategory: null },
              ...(user?.schoolCategory ? [{ targetSchoolCategory: user.schoolCategory }] : []),
            ],
          },
          {
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
        ],
      },
      include: {
        reads: {
          where: { userId },
          select: { id: true, readAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    for (const ann of announcements) {
      const isRead = ann.reads.length > 0;
      notifications.push({
        id: ann.id,
        type: ann.type,
        title: ann.title,
        message: ann.message,
        link: ann.link || "/dashboard",
        createdAt: ann.createdAt,
        isUrgent: ann.isUrgent,
        isRead,
        isPersisted: true,
      });
    }

    // Sort: Urgent first, then unread first, then newest
    notifications.sort((a, b) => {
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      if (!a.isRead && b.isRead) return -1;
      if (a.isRead && !b.isRead) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return Object.assign(notifications, {
      notifications,
      unreadCount,
    });
  }

  /**
   * Generate payload for Web Push Notification for daily study reminder
   */
  static getDailyExamPushPayload() {
    return {
      title: "منصة الخلاصة | افهمها صح.. هتفضل معاك",
      body: "حان موعد تحدي الدخول اليومي. ثبّت معلوماتك واستمر في الصدارة!",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      url: "/dashboard",
      tag: "daily-gatekeeper-exam",
    };
  }

  /**
   * Mark a specific persistent announcement as read for a student
   */
  static async markAsRead(userId: string, notificationId: string): Promise<boolean> {
    // If it's a persisted DB announcement
    const exists = await prisma.announcement.findUnique({
      where: { id: notificationId },
      select: { id: true },
    });

    if (exists) {
      await prisma.notificationRead.upsert({
        where: {
          userId_announcementId: {
            userId,
            announcementId: notificationId,
          },
        },
        create: {
          userId,
          announcementId: notificationId,
        },
        update: {},
      });
      return true;
    }

    return false;
  }

  /**
   * Mark all active announcements as read for a student
   */
  static async markAllAsRead(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { gradeId: true, schoolCategory: true },
    });

    const now = new Date();
    const activeAnnouncements = await prisma.announcement.findMany({
      where: {
        AND: [
          {
            OR: [
              { targetGradeId: null },
              ...(user?.gradeId ? [{ targetGradeId: user.gradeId }] : []),
            ],
          },
          {
            OR: [
              { targetSchoolCategory: null },
              ...(user?.schoolCategory ? [{ targetSchoolCategory: user.schoolCategory }] : []),
            ],
          },
          {
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
          {
            reads: {
              none: { userId },
            },
          },
        ],
      },
      select: { id: true },
    });

    if (activeAnnouncements.length === 0) return 0;

    await prisma.notificationRead.createMany({
      data: activeAnnouncements.map((a) => ({
        userId,
        announcementId: a.id,
      })),
      skipDuplicates: true,
    });

    return activeAnnouncements.length;
  }

  /**
   * Create an Admin Announcement and optionally broadcast it via Web Push
   */
  static async createAnnouncement(data: {
    title: string;
    message: string;
    type?: NotificationType;
    targetGradeId?: string | null;
    targetSchoolCategory?: SchoolCategory | null;
    link?: string | null;
    isUrgent?: boolean;
    expiresAt?: Date | null;
    createdById?: string;
    sendPush?: boolean;
  }) {
    const announcement = await prisma.announcement.create({
      data: {
        title: data.title.trim(),
        message: data.message.trim(),
        type: data.type || NotificationType.ANNOUNCEMENT,
        targetGradeId: data.targetGradeId || null,
        targetSchoolCategory: data.targetSchoolCategory || null,
        link: data.link ? data.link.trim() : null,
        isUrgent: Boolean(data.isUrgent),
        expiresAt: data.expiresAt || null,
        createdById: data.createdById || null,
      },
    });

    // If sendPush is true, broadcast web push notification to target subscribers
    if (data.sendPush) {
      void this.broadcastPushNotification({
        title: data.title,
        body: data.message,
        url: data.link || "/dashboard",
        targetGradeId: data.targetGradeId || undefined,
        targetSchoolCategory: data.targetSchoolCategory || undefined,
      }).catch((err) => {
        console.error("Failed to broadcast push notification:", err);
      });
    }

    return announcement;
  }

  /**
   * List announcements for Admin Management
   */
  static async listAdminAnnouncements(params?: {
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, params?.page || 1);
    const limit = Math.min(50, Math.max(1, params?.limit || 20));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.announcement.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          _count: { select: { reads: true } },
        },
      }),
      prisma.announcement.count(),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Delete an announcement
   */
  static async deleteAnnouncement(id: string) {
    return prisma.announcement.delete({
      where: { id },
    });
  }

  // ==========================================
  // Web Push Notifications Subscription Management
  // ==========================================

  /**
   * Save or update a browser push subscription for a user
   */
  static async savePushSubscription(
    userId: string,
    subscription: {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    },
    userAgent?: string
  ) {
    if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      throw new Error("بيانات اشتراك الإشعار غير مكتملة");
    }

    return prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: userAgent || null,
      },
      update: {
        userId,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: userAgent || null,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Remove a push subscription when unregistered
   */
  static async removePushSubscription(endpoint: string) {
    return prisma.pushSubscription.deleteMany({
      where: { endpoint },
    });
  }

  /**
   * Send a Web Push notification to a specific subscriber
   */
  static async sendPushToSubscription(
    sub: { endpoint: string; p256dh: string; auth: string },
    payload: { title: string; body: string; url?: string; icon?: string; tag?: string }
  ) {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    };

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      data: {
        url: payload.url || "/dashboard",
      },
      tag: payload.tag || "kholasa-notification",
    });

    try {
      await webpush.sendNotification(pushSubscription, notificationPayload);
      return { success: true };
    } catch (err: unknown) {
      const error = err as { statusCode?: number };
      // 410 Gone or 404 means the subscription has expired or was revoked by the user
      if (error?.statusCode === 410 || error?.statusCode === 404) {
        await prisma.pushSubscription.deleteMany({
          where: { endpoint: sub.endpoint },
        });
      }
      return { success: false, error: err };
    }
  }

  /**
   * Broadcast a push notification to users matching criteria
   */
  static async broadcastPushNotification(payload: {
    title: string;
    body: string;
    url?: string;
    targetGradeId?: string;
    targetSchoolCategory?: SchoolCategory;
  }) {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        user: {
          ...(payload.targetGradeId ? { gradeId: payload.targetGradeId } : {}),
          ...(payload.targetSchoolCategory ? { schoolCategory: payload.targetSchoolCategory } : {}),
        },
      },
      select: {
        endpoint: true,
        p256dh: true,
        auth: true,
      },
    });

    if (subscriptions.length === 0) {
      return { sentCount: 0, total: 0 };
    }

    let sentCount = 0;
    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const res = await this.sendPushToSubscription(sub, payload);
        if (res.success) sentCount++;
      })
    );

    return { sentCount, total: subscriptions.length };
  }
}
