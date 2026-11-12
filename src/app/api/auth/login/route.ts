import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { Role, SchoolCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { UserService } from "@/services";
import { verifyPassword, createSession, destroySession } from "@/lib/auth";
import {
  DEMO_SESSION_TTL_MS,
  cleanupExpiredDemoSandboxes,
  generateDemoSandboxLoginCode,
  getDemoTemplateDefaults,
  isDemoSandboxCode,
  isDemoTemplateCode,
} from "@/lib/demo";
import { forbidden, jsonError, parseJson, unauthorized } from "@/lib/http";
import {
  assertRateLimitAvailable,
  getClientIp,
  rateLimit,
  recordRateLimitAttempt,
  resetRateLimit,
  withRetryAfter,
} from "@/lib/rate-limit";
import { AUTHORIZED_CENTERS } from "@/lib/centers";

const loginSchema = z
  .object({
    code: z.string().trim().max(50).optional(),
    identifier: z.string().trim().max(254).optional(),
    password: z.string().trim().max(200).optional(),
    deviceId: z.string().trim().max(128).optional(),
    studyMode: z.enum(["ONLINE", "OFFLINE"]).optional(),
    centerName: z.string().trim().max(100).optional(),
  })
  .refine(
    (data) => Boolean(data.code?.trim() || (data.identifier?.trim() && data.password?.trim())),
    { message: "يرجى إدخال كود الطالب، أو البريد/الهاتف وكلمة المرور" }
  );

const INVALID = "بيانات الدخول غير صحيحة، يرجى التأكد من الرقم أو كلمة المرور";
const INVALID_CODE =
  "كود الدخول غير صحيح. تأكد من كتابة الأحرف والأرقام بدقة بدون مسافات، أو تواصل معنا إذا نسيت الكود.";

async function createDemoSandboxLoginResponse(params: {
  templateCode: "DEMO-AR" | "DEMO-EN";
  ip: string;
  studyMode?: "ONLINE" | "OFFLINE";
  centerName?: string;
  resolvedDeviceId: string | null;
}) {
  const { templateCode, ip, studyMode, centerName, resolvedDeviceId } = params;

  // Rate limit per visitor IP (never globally on shared DEMO code)
  rateLimit(`login:demo:ip:${ip}`, 20, 15 * 60 * 1000);

  // Terminate any prior session on this browser so the student starts a fresh isolated session
  await destroySession();

  const defaults = getDemoTemplateDefaults(templateCode);
  const templateUser = await UserService.findByLoginCode(templateCode);
  if (templateUser && templateUser.isActive === false) {
    throw unauthorized("تم تعطيل هذا الحساب التجريبي");
  }

  const targetSchoolCategory =
    defaults.schoolCategory === "LANGUAGES"
      ? SchoolCategory.LANGUAGES
      : SchoolCategory.ARABIC;

  const updatedStudyMode = studyMode || templateUser?.studyMode || "ONLINE";
  const updatedCenterName =
    updatedStudyMode === "OFFLINE"
      ? centerName?.trim() || templateUser?.centerName || defaults.defaultCenter
      : null;

  // Match the active published curriculum grade/system for the chosen track
  const publishedCurriculum =
    (await prisma.subject?.findFirst({
      where: { isPublished: true, schoolCategory: targetSchoolCategory },
      select: { gradeId: true, systemId: true, trackId: true },
    })) ||
    (await prisma.subject?.findFirst({
      where: { isPublished: true },
      select: { gradeId: true, systemId: true, trackId: true },
    }));

  const targetGradeId = publishedCurriculum?.gradeId || templateUser?.gradeId || null;
  const targetSystemId = publishedCurriculum?.systemId || templateUser?.systemId || null;
  const targetTrackId = templateUser?.trackId ?? publishedCurriculum?.trackId ?? null;

  const sandboxCode = generateDemoSandboxLoginCode(templateCode);
  const sandboxUser = await prisma.user.create({
    data: {
      name: defaults.name,
      loginCode: sandboxCode,
      role: Role.STUDENT,
      schoolCategory: targetSchoolCategory,
      gradeId: targetGradeId,
      systemId: targetSystemId,
      trackId: targetTrackId,
      studyMode: updatedStudyMode,
      centerName: updatedCenterName,
      subscriptionStatus: defaults.subscriptionStatus,
      isActive: true,
      maxDevices: 5,
      boundDevices: resolvedDeviceId ? [resolvedDeviceId] : [],
    },
  });

  // Opportunistically purge expired sandbox accounts without blocking the response
  void cleanupExpiredDemoSandboxes();

  await createSession(sandboxUser.id, resolvedDeviceId || undefined, {
    ttlMs: DEMO_SESSION_TTL_MS,
  });

  return NextResponse.json({
    success: true,
    isDemoSandbox: true,
    user: {
      id: sandboxUser.id,
      name: sandboxUser.name,
      email: sandboxUser.email,
      phone: sandboxUser.phone,
      loginCode: sandboxUser.loginCode,
      role: sandboxUser.role,
      systemId: sandboxUser.systemId,
      gradeId: sandboxUser.gradeId,
      schoolCategory: sandboxUser.schoolCategory,
      studyMode: sandboxUser.studyMode,
      centerName: sandboxUser.centerName,
      subscriptionStatus: sandboxUser.subscriptionStatus,
    },
  });
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    rateLimit(`login:burst:ip:${ip}`, 40, 60 * 1000);
    const body = await parseJson(req, loginSchema);
    const deviceId = body.deviceId;
    const cookieStore = await cookies();
    let resolvedDeviceId = deviceId || cookieStore.get("kholasa_device_id")?.value || null;

    // 1A. Ephemeral Isolated Demo Sandbox Login (DEMO-AR / DEMO-EN / DEMO-PRO)
    if (body.code?.trim()) {
      const cleanCode = body.code.trim().toUpperCase();

      // Reject direct reuse of someone else's ephemeral sandbox code
      if (isDemoSandboxCode(cleanCode)) {
        throw unauthorized(INVALID_CODE);
      }

      if (isDemoTemplateCode(cleanCode)) {
        return createDemoSandboxLoginResponse({
          templateCode: cleanCode,
          ip,
          studyMode: body.studyMode,
          centerName: body.centerName,
          resolvedDeviceId,
        });
      }
    }

    let user = null;

    assertRateLimitAvailable(`login:ip:${ip}`, 10, 60 * 1000);

    // 1B. Direct Real Student Code Login
    if (body.code?.trim()) {
      const cleanCode = body.code.trim().toUpperCase();
      assertRateLimitAvailable(`login:code:${cleanCode}`, 8, 15 * 60 * 1000);
      user = await UserService.findByLoginCode(cleanCode);
      if (!user || user.role !== Role.STUDENT) {
        recordRateLimitAttempt(`login:code:${cleanCode}`, 15 * 60 * 1000);
        recordRateLimitAttempt(`login:ip:${ip}`, 60 * 1000);
        throw unauthorized(INVALID_CODE);
      }
    }
    // 2. Staff / Credential Login (Identifier + Password)
    else if (body.identifier?.trim() && body.password?.trim()) {
      const identifier = body.identifier.trim();
      const password = body.password.trim();
      const idKey = `login:id:${identifier.toLowerCase()}`;
      assertRateLimitAvailable(idKey, 10, 15 * 60 * 1000);

      user = await UserService.findByIdentifier(identifier);
      if (!user || !user.password) {
        recordRateLimitAttempt(idKey, 15 * 60 * 1000);
        recordRateLimitAttempt(`login:ip:${ip}`, 60 * 1000);
        throw unauthorized(INVALID);
      }

      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        recordRateLimitAttempt(idKey, 15 * 60 * 1000);
        recordRateLimitAttempt(`login:ip:${ip}`, 60 * 1000);
        throw unauthorized(INVALID);
      }

      // Never issue a session directly for shared DEMO template rows (e.g. demo-ar@kholasa.app)
      if (isDemoTemplateCode(user.loginCode)) {
        resetRateLimit(`login:ip:${ip}`);
        resetRateLimit(idKey);
        return createDemoSandboxLoginResponse({
          templateCode: user.loginCode,
          ip,
          studyMode: body.studyMode,
          centerName: body.centerName,
          resolvedDeviceId,
        });
      }
    } else {
      throw unauthorized("بيانات تسجيل الدخول غير مكتملة");
    }

    // Account Activation / Suspension Check for Students & Staff
    if (user.isActive === false) {
      if (body.code?.trim()) {
        recordRateLimitAttempt(`login:code:${body.code.trim().toUpperCase()}`, 15 * 60 * 1000);
      }
      recordRateLimitAttempt(`login:ip:${ip}`, 60 * 1000);
      throw forbidden(
        user.role === Role.STUDENT
          ? "عذراً، هذا الحساب معلق أو بانتظار التفعيل حالياً. يرجى مراجعة المساعد أو إدارة المنصة لتفعيل حسابك."
          : "عذراً، هذا الحساب موقوف حالياً. يرجى التواصل مع إدارة المنصة لإعادة تفعيله."
      );
    }

    // Strict Device Binding for Students
    if (user.role === Role.STUDENT) {
      if (!resolvedDeviceId) {
        resolvedDeviceId = `dev_${Buffer.from(ip + user.id).toString("base64url").slice(0, 24)}`;
      }

      const bound = user.boundDevices || [];
      const isAlreadyBound = bound.includes(resolvedDeviceId);

      if (!isAlreadyBound) {
        if (bound.length >= user.maxDevices) {
          const devLimitText = user.maxDevices === 1 ? "جهاز واحد فقط" : `${user.maxDevices} أجهزة`;
          throw forbidden(
            `عذراً، هذا الحساب وصل إلى الحد الأقصى من الأجهزة المصرح بها ومقترن بـ (${devLimitText}). لا يمكن تسجيل الدخول من هذا الجهاز الجديد إلا بعد موافقة الإدارة أو فك ربط أجهزتك القديمة.`
          );
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            boundDevices: Array.from(new Set([...bound, resolvedDeviceId])),
          },
        });
      }
    }

    // Attendance Mode, School Category & Curriculum Sync for Students
    let updatedStudyMode = user.studyMode;
    let updatedCenterName = user.centerName;
    let targetSchoolCategory = user.schoolCategory || SchoolCategory.ARABIC;
    let targetGradeId = user.gradeId;
    let targetSystemId = user.systemId;

    if (user.role === Role.STUDENT) {
      if (body.studyMode) {
        updatedStudyMode = body.studyMode;
        updatedCenterName =
          body.studyMode === "OFFLINE"
            ? body.centerName?.trim() || user.centerName || "سنتر رافال عربي"
            : null;
      }

      // 1. Strict Category Scoping: Respect student's registered curriculum
      if (user.schoolCategory) {
        targetSchoolCategory = user.schoolCategory;
      } else if (updatedCenterName) {
        const matchedCenter = AUTHORIZED_CENTERS.find(
          (c) => c.name === updatedCenterName
        );
        if (matchedCenter) {
          targetSchoolCategory = matchedCenter.category;
        }
      }

      // 2. Safeguard for missing or orphaned grade/system (matched to student's school category)
      const publishedCurriculum =
        (await prisma.subject?.findFirst({
          where: { isPublished: true, schoolCategory: targetSchoolCategory },
          select: { gradeId: true, systemId: true },
        })) ||
        (await prisma.subject?.findFirst({
          where: { isPublished: true },
          select: { gradeId: true, systemId: true },
        }));

      if (publishedCurriculum) {
        targetGradeId = targetGradeId || publishedCurriculum.gradeId;
        targetSystemId = targetSystemId || publishedCurriculum.systemId;
      }

      const studentUpdateData: Record<string, unknown> = {};
      if (body.studyMode) {
        studentUpdateData.studyMode = updatedStudyMode;
        studentUpdateData.centerName = updatedCenterName;
      }
      if (targetSchoolCategory !== (user.schoolCategory || SchoolCategory.ARABIC)) {
        studentUpdateData.schoolCategory = targetSchoolCategory;
      }
      if ((targetGradeId ?? null) !== (user.gradeId ?? null)) {
        studentUpdateData.gradeId = targetGradeId;
      }
      if ((targetSystemId ?? null) !== (user.systemId ?? null)) {
        studentUpdateData.systemId = targetSystemId;
      }

      if (Object.keys(studentUpdateData).length > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: studentUpdateData,
        });
      }
    }

    // Clear failed rate-limit counters on successful authentication
    resetRateLimit(`login:ip:${ip}`);
    if (body.code?.trim()) {
      resetRateLimit(`login:code:${body.code.trim().toUpperCase()}`);
    }
    if (body.identifier?.trim()) {
      resetRateLimit(`login:id:${body.identifier.trim().toLowerCase()}`);
    }

    // Clear any prior session (including ephemeral demo session) before signing in as real account
    await destroySession();
    await createSession(user.id, resolvedDeviceId || undefined);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        loginCode: user.loginCode,
        role: user.role,
        systemId: targetSystemId,
        gradeId: targetGradeId,
        schoolCategory: targetSchoolCategory,
        studyMode: updatedStudyMode,
        centerName: updatedCenterName,
        subscriptionStatus: user.subscriptionStatus,
      },
    });
  } catch (error) {
    return withRetryAfter(jsonError(error), error);
  }
}
