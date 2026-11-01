import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { UserService } from "@/services";
import { verifyPassword, createSession } from "@/lib/auth";
import { forbidden, jsonError, parseJson, unauthorized } from "@/lib/http";
import { getClientIp, rateLimit, withRetryAfter } from "@/lib/rate-limit";

const loginSchema = z.object({
  identifier: z.string().min(3, "يرجى إدخال رقم الهاتف أو البريد الإلكتروني").max(254),
  password: z.string().min(1, "يرجى إدخال كلمة المرور").max(200),
  deviceId: z.string().trim().max(128).optional(),
});

const INVALID = "بيانات الدخول غير صحيحة، يرجى التأكد من الرقم أو كلمة المرور";

export async function POST(req: Request) {
  try {
    rateLimit(`login:ip:${getClientIp(req)}`, 5, 60 * 1000);
    const { identifier, password, deviceId } = await parseJson(req, loginSchema);
    rateLimit(`login:id:${identifier.trim().toLowerCase()}`, 10, 15 * 60 * 1000);

    const user = await UserService.findByIdentifier(identifier);

    if (!user || !user.password) throw unauthorized(INVALID);

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) throw unauthorized(INVALID);

    const cookieStore = await cookies();
    let resolvedDeviceId = deviceId || cookieStore.get("kholasa_device_id")?.value || null;

    if (user.role === Role.STUDENT) {
      if (!resolvedDeviceId) {
        const ip = getClientIp(req);
        resolvedDeviceId = `dev_${Buffer.from(ip + user.id).toString("base64url").slice(0, 24)}`;
      }

      const bound = user.boundDevices || [];
      const isAlreadyBound = bound.includes(resolvedDeviceId);

      if (!isAlreadyBound) {
        if (bound.length >= user.maxDevices) {
          throw forbidden(
            `عذراً، هذا الحساب مسجل بالفعل على الحد الأقصى من الأجهزة المصرح بها (${user.maxDevices} أجهزة). يرجى تسجيل الدخول من جهازك المعتمد أو التواصل مع الإدارة لإعادة ضبط أجهزتك.`
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
        role: user.role,
        systemId: user.systemId,
        gradeId: user.gradeId,
      },
    });
  } catch (error) {
    return withRetryAfter(jsonError(error), error);
  }
}
