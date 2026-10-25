import { prisma } from "@/lib/prisma";

export interface InAppNotification {
  id: string;
  type: "DAILY_EXAM" | "MISTAKES" | "PROGRESS" | "SYSTEM";
  title: string;
  message: string;
  link: string;
  createdAt: Date;
  isUrgent?: boolean;
}

export class NotificationService {
  /**
   * Generate live intelligent notifications for a student based on their current academic state
   */
  static async getInAppNotifications(userId: string): Promise<InAppNotification[]> {
    const notifications: InAppNotification[] = [];

    // 1. Check if daily gatekeeper exam is pending today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

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
        title: "الامتحان اليومي بانتظارك!",
        message: "ابدأ يومك بتحدي سريع لقياس جاهزيتك وتثبيت شعلة التزامك اليومي.",
        link: "/dashboard",
        createdAt: new Date(),
        isUrgent: true,
      });
    }

    // 2. Check for unresolved mistakes
    const unresolvedMistakesCount = await prisma.mistakeReview.count({
      where: { userId, isResolved: false },
    });

    if (unresolvedMistakesCount > 0) {
      notifications.push({
        id: `mistakes_${unresolvedMistakesCount}`,
        type: "MISTAKES",
        title: "ركن «غلطاتي» يحتاج مراجعة",
        message: `لديك ${unresolvedMistakesCount} أسئلة غير متقنة. راجعها الآن لتحويل نقاط ضعفك إلى قوة!`,
        link: "/mistakes",
        createdAt: new Date(),
        isUrgent: false,
      });
    }

    // 3. Check for recently accessed unfinished lessons
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
      });
    }

    return notifications;
  }

  /**
   * Generate payload for Web Push Notification for daily study reminder
   */
  static getDailyExamPushPayload() {
    return {
      title: "منصة الخلاصة | افهمها صح.. هتفضل معاك",
      body: "حان موعد تحدي الدخول اليومي. ثبّت معلوماتك واستمر في الصدارة!",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      url: "/dashboard",
      tag: "daily-gatekeeper-exam",
    };
  }
}
