import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { z } from "zod";
import { Role, SchoolCategory, StudyMode, SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  destroySession,
  generateUniqueLoginCode,
  getCurrentUser,
  hashPassword,
} from "@/lib/auth";
import { isAnyDemoCode } from "@/lib/demo-shared";
import { badRequest, conflict, forbidden, jsonError } from "@/lib/http";
import {
  assertRateLimitAvailable,
  getClientIp,
  rateLimit,
  recordRateLimitAttempt,
} from "@/lib/rate-limit";
import { normalizeDigits } from "@/lib/validation/auth";
import { AnalyticsService } from "@/services/analytics.service";
import { emitRealtimeEvent, revalidatePlatformPaths } from "@/lib/realtime";

export const dynamic = "force-dynamic";

const registerForSubscriptionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "يرجى كتابة الاسم الثلاثي على الأقل (3 أحرف أو أكثر).")
    .max(100, "الاسم طويل جداً."),
  phone: z.string().trim().min(1, "يرجى إدخال رقم الموبايل."),
  schoolCategory: z.enum(["ARABIC", "LANGUAGES"], {
    message: "يرجى اختيار الشعبة (عربي أو لغات).",
  }),
  gradeId: z.string().trim().min(1, "يرجى اختيار الصف الدراسي."),
  trackId: z.string().trim().max(80).optional().nullable(),
  studyMode: z.enum(["ONLINE", "OFFLINE"]).default("ONLINE"),
  centerName: z.string().trim().max(100).optional().nullable(),
  deviceId: z.string().trim().max(128).optional().nullable(),
});

async function validateRegistrationPayload(rawBody: unknown) {
  const parsed = registerForSubscriptionSchema.safeParse(rawBody);
  if (!parsed.success) {
    throw badRequest(parsed.error.issues[0]?.message || "يرجى مراجعة البيانات المدخلة.");
  }

  const data = parsed.data;
  const cleanPhone = normalizeDigits(data.phone);
  if (!/^01[0125]\d{8}$/.test(cleanPhone)) {
    throw badRequest(
      "يرجى إدخال رقم موبايل مصري صحيح مكون من 11 رقماً (يبدأ بـ 010 أو 011 أو 012 أو 015)."
    );
  }

  const grade = await prisma.grade.findUnique({
    where: { id: data.gradeId },
    select: {
      id: true,
      systemId: true,
      system: { select: { isActive: true } },
    },
  });
  if (!grade || !grade.system.isActive) {
    throw badRequest("الصف الدراسي المختار غير متاح حالياً.");
  }

  let validTrackId: string | null = null;
  if (data.trackId && data.trackId.trim()) {
    const track = await prisma.academicTrack.findUnique({
      where: { id: data.trackId.trim() },
      select: { id: true, gradeId: true },
    });
    if (!track || track.gradeId !== grade.id) {
      throw badRequest("المسار الدراسي المحدد لا يتبع هذا الصف.");
    }
    validTrackId = track.id;
  }

  const resolvedStudyMode =
    data.studyMode === "OFFLINE" ? StudyMode.OFFLINE : StudyMode.ONLINE;
  const resolvedCenterName =
    resolvedStudyMode === StudyMode.OFFLINE ? data.centerName?.trim() || null : null;
  if (resolvedStudyMode === StudyMode.OFFLINE && !resolvedCenterName) {
    throw badRequest("يرجى اختيار اسم السنتر التعليمي أو كتابته.");
  }

  return {
    name: data.name.trim(),
    cleanPhone,
    schoolCategory:
      data.schoolCategory === "LANGUAGES"
        ? SchoolCategory.LANGUAGES
        : SchoolCategory.ARABIC,
    gradeId: grade.id,
    systemId: grade.systemId,
    trackId: validTrackId,
    studyMode: resolvedStudyMode,
    centerName: resolvedCenterName,
    deviceId: data.deviceId,
  };
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    rateLimit(`sub_reg:burst:ip:${ip}`, 10, 60 * 1000);
    assertRateLimitAvailable(`sub_reg:ip:${ip}`, 8, 15 * 60 * 1000);

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      throw badRequest("بيانات الطلب غير صالحة.");
    }

    const currentUser = await getCurrentUser();
    if (currentUser && !isAnyDemoCode(currentUser.loginCode)) {
      if (currentUser.role === Role.STUDENT) {
        throw badRequest("حسابك مسجل بالفعل — يمكنك التحويل ورفع الإيصال مباشرة.");
      }
      throw forbidden("أنت مسجل الدخول بحساب إدارة حالياً.");
    }

    const validated = await validateRegistrationPayload(rawBody);

    const existingPhoneUser = await prisma.user.findUnique({
      where: { phone: validated.cleanPhone },
      select: { id: true },
    });
    if (existingPhoneUser) {
      recordRateLimitAttempt(`sub_reg:ip:${ip}`, 15 * 60 * 1000);
      throw conflict(
        "رقم الموبايل ده متسجل قبل كده — سجّل دخول بكود الطالب من صفحة الدخول، أو تواصل مع الدعم لو نسيت الكود."
      );
    }

    // End any prior ephemeral demo sandbox session cleanly before creating the permanent student session
    if (currentUser && isAnyDemoCode(currentUser.loginCode)) {
      await destroySession();
    }

    const loginCode = await generateUniqueLoginCode();
    const initialHashedPassword = await hashPassword(randomBytes(16).toString("hex"));

    const cookieStore = await cookies();
    const resolvedDeviceId =
      validated.deviceId?.trim() || cookieStore.get("kholasa_device_id")?.value || null;

    const newStudent = await prisma.user.create({
      data: {
        name: validated.name,
        phone: validated.cleanPhone,
        password: initialHashedPassword,
        loginCode,
        role: Role.STUDENT,
        schoolCategory: validated.schoolCategory,
        gradeId: validated.gradeId,
        systemId: validated.systemId,
        trackId: validated.trackId,
        studyMode: validated.studyMode,
        centerName: validated.centerName,
        isActive: true,
        subscriptionStatus: SubscriptionStatus.TRIAL,
        maxDevices: 1,
        boundDevices: resolvedDeviceId ? [resolvedDeviceId] : [],
      },
      select: {
        id: true,
        name: true,
        phone: true,
        loginCode: true,
        schoolCategory: true,
        gradeId: true,
        systemId: true,
        trackId: true,
        studyMode: true,
        centerName: true,
        subscriptionStatus: true,
      },
    });

    await createSession(newStudent.id, resolvedDeviceId || undefined);

    await AnalyticsService.logAuditAction(
      newStudent.id,
      "REGISTER",
      "student_subscription",
      newStudent.loginCode || newStudent.id,
      {
        schoolCategory: newStudent.schoolCategory,
        gradeId: newStudent.gradeId,
        studyMode: newStudent.studyMode,
      }
    ).catch(() => null);

    revalidatePlatformPaths(["/admin/users", "/admin/reports", "/subscription"]);
    emitRealtimeEvent({
      topic: "users",
      action: "user_created",
      audience: "staff",
      entityId: newStudent.id,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "تم تسجيل حسابك بنجاح! كود الدخول الخاص بيك جاهز، تقدر دلوقتي تحوّل المبلغ وترفع إيصال الدفع.",
        user: newStudent,
      },
      { status: 201 }
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || isAnyDemoCode(currentUser.loginCode)) {
      throw badRequest("يرجى تسجيل بياناتك أولاً.");
    }
    if (currentUser.role !== Role.STUDENT) {
      throw forbidden("لا يمكن تعديل حسابات الإدارة من بوابة الاشتراك.");
    }
    if (currentUser.subscriptionStatus === SubscriptionStatus.ACTIVE) {
      throw badRequest("حسابك مفعّل بالفعل — يمكنك تعديل بياناتك من الملف الشخصي.");
    }

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      throw badRequest("بيانات الطلب غير صالحة.");
    }

    const validated = await validateRegistrationPayload(rawBody);

    const duplicatePhone = await prisma.user.findFirst({
      where: { phone: validated.cleanPhone, NOT: { id: currentUser.id } },
      select: { id: true },
    });
    if (duplicatePhone) {
      throw conflict("رقم الموبايل ده مسجّل لحساب طالب آخر.");
    }

    const updatedStudent = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: validated.name,
        phone: validated.cleanPhone,
        schoolCategory: validated.schoolCategory,
        gradeId: validated.gradeId,
        systemId: validated.systemId,
        trackId: validated.trackId,
        studyMode: validated.studyMode,
        centerName: validated.centerName,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        loginCode: true,
        schoolCategory: true,
        gradeId: true,
        systemId: true,
        trackId: true,
        studyMode: true,
        centerName: true,
        subscriptionStatus: true,
      },
    });

    revalidatePlatformPaths(["/admin/users", "/subscription"]);

    return NextResponse.json({
      success: true,
      message: "تم حفظ تعديلات بيانات التسجيل بنجاح.",
      user: updatedStudent,
    });
  } catch (error) {
    return jsonError(error);
  }
}

