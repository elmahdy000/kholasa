import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, canManageAnnouncements } from "@/lib/auth";
import { NotificationService } from "@/services/notification.service";
import { prisma } from "@/lib/prisma";
import { emitRealtimeEvent, revalidatePlatformPaths } from "@/lib/realtime";
import { NotificationType, SchoolCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = { "Cache-Control": "no-store, must-revalidate" };

const createAnnouncementSchema = z.object({
  title: z.string().trim().min(1, "عنوان الإشعار مطلوب").max(160, "عنوان الإشعار طويل جداً"),
  message: z.string().trim().min(1, "نص الإشعار مطلوب").max(2000, "نص الإشعار طويل جداً"),
  type: z
    .nativeEnum(NotificationType)
    .optional()
    .default(NotificationType.ANNOUNCEMENT),
  targetGradeId: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  targetSchoolCategory: z
    .preprocess(
      (v) => (v === "" || v === "ALL" || v === undefined ? null : v),
      z.nativeEnum(SchoolCategory).nullable()
    )
    .optional()
    .default(null),
  link: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null))
    .refine(
      (v) =>
        v === null ||
        (v.startsWith("/") && !v.startsWith("//")) ||
        /^https?:\/\//i.test(v),
      { message: "رابط التوجيه غير صالح" }
    ),
  isUrgent: z.boolean().optional().default(false),
  expiresAt: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null))
    .refine((v) => v === null || !Number.isNaN(Date.parse(v)), {
      message: "تاريخ الانتهاء غير صالح",
    }),
  sendPush: z.boolean().optional().default(false),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageAnnouncements(user.role)) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 403, headers: NO_STORE_HEADERS }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    const [result, pushSubscribersCount] = await Promise.all([
      NotificationService.listAdminAnnouncements({ page, limit }),
      typeof prisma.pushSubscription?.count === "function"
        ? prisma.pushSubscription.count()
        : Promise.resolve(0),
    ]);

    return NextResponse.json(
      { ...result, pushSubscribersCount },
      { headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    console.error("Admin list announcements error:", err);
    return NextResponse.json(
      { error: "فشل استرجاع الإعلانات" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageAnnouncements(user.role)) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 403, headers: NO_STORE_HEADERS }
      );
    }

    const rawBody = await req.json().catch(() => null);
    const parsed = createAnnouncementSchema.safeParse(rawBody);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || "بيانات الإشعار غير صالحة";
      return NextResponse.json(
        { error: firstIssue },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const data = parsed.data;
    const announcement = await NotificationService.createAnnouncement({
      title: data.title,
      message: data.message,
      type: data.type,
      targetGradeId: data.targetGradeId,
      targetSchoolCategory: data.targetSchoolCategory,
      link: data.link,
      isUrgent: data.isUrgent,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      createdById: user.id,
      sendPush: data.sendPush,
    });

    const pushResult =
      "pushResult" in announcement
        ? (announcement as { pushResult?: { sentCount: number; total: number } | null }).pushResult ??
          null
        : null;

    revalidatePlatformPaths(["/admin/notifications", "/dashboard"]);
    emitRealtimeEvent({
      topic: "notifications",
      action: "created",
      audience: "all",
      targetGradeId: announcement.targetGradeId,
      targetCategory: announcement.targetSchoolCategory,
      entityId: announcement.id,
    });

    return NextResponse.json(
      { announcement, pushResult },
      { status: 201, headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    console.error("Admin create announcement error:", err);
    return NextResponse.json(
      { error: "فشل إنشاء الإشعار" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
