import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { UserService } from "@/services";
import { verifyPassword, createSession } from "@/lib/auth";
import { forbidden, jsonError, parseJson, unauthorized } from "@/lib/http";
import { getClientIp, rateLimit, withRetryAfter } from "@/lib/rate-limit";

const loginSchema = z
  .object({
    code: z.string().trim().max(50).optional(),
    identifier: z.string().trim().max(254).optional(),
    password: z.string().trim().max(200).optional(),
    deviceId: z.string().trim().max(128).optional(),
  })
  .refine(
    (data) => Boolean(data.code?.trim() || (data.identifier?.trim() && data.password?.trim())),
    { message: "يرجى إدخال كود الطالب، أو البريد/الهاتف وكلمة المرور" }
  );

const INVALID = "بيانات الدخول غير صحيحة، يرجى التأكد من الرقم أو كلمة المرور";
const INVALID_CODE = "كود الدخول غير صحيح أو أن حسابك غير مفعّل. يرجى التواصل مع الإدارة أو المساعد.";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    rateLimit(`login:ip:${ip}`, 10, 60 * 1000);
    const body = await parseJson(req, loginSchema);
    const deviceId = body.deviceId;

    let user = null;

    // 1. Direct Student Code Login
    if (body.code?.trim()) {
      const cleanCode = body.code.trim().toUpperCase();
      rateLimit(`login:code:${cleanCode}`, 8, 15 * 60 * 1000);
      user = await UserService.findByLoginCode(cleanCode);
      if (!user) {
        throw unauthorized(INVALID_CODE);
      }
    }
    // 2. Staff / Credential Login (Identifier + Password)
    else if (body.identifier?.trim() && body.password?.trim()) {
      const identifier = body.identifier.trim();
      const password = body.password.trim();
      rateLimit(`login:id:${identifier.toLowerCase()}`, 10, 15 * 60 * 1000);

      user = await UserService.findByIdentifier(identifier);
      if (!user || !user.password) throw unauthorized(INVALID);

      const isValid = await verifyPassword(password, user.password);
      if (!isValid) throw unauthorized(INVALID);
    } else {
      throw unauthorized("بيانات تسجيل الدخول غير مكتملة");
    }

    // Account Activation / Suspension Check for Students
    if (user.role === Role.STUDENT && user.isActive === false) {
      throw forbidden(
        "عذراً، هذا الحساب معلق أو بانتظار التفعيل حالياً. يرجى مراجعة المساعد أو إدارة المنصة لتفعيل حسابك."
      );
    }

    const cookieStore = await cookies();
    let resolvedDeviceId = deviceId || cookieStore.get("kholasa_device_id")?.value || null;

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
        systemId: user.systemId,
        gradeId: user.gradeId,
      },
    });
  } catch (error) {
    return withRetryAfter(jsonError(error), error);
  }
}
