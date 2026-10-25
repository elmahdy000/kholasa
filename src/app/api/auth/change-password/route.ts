import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createSession,
  destroyAllSessions,
  getCurrentUser,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { badRequest, jsonError, parseJson, unauthorized } from "@/lib/http";
import { rateLimit, withRetryAfter } from "@/lib/rate-limit";
import { passwordSchema } from "@/lib/validation/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  currentPassword: z.string().min(1, "يرجى إدخال كلمة المرور الحالية").max(200),
  newPassword: passwordSchema,
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw unauthorized("غير مصرح");

    rateLimit(`password:${user.id}`, 5, 15 * 60 * 1000);

    const { currentPassword, newPassword } = await parseJson(req, schema);

    const account = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    });

    if (!account?.password) {
      throw badRequest("هذا الحساب لا يدعم تغيير كلمة المرور");
    }

    const isValid = await verifyPassword(currentPassword, account.password);
    if (!isValid) {
      throw badRequest("كلمة المرور الحالية غير صحيحة");
    }

    if (currentPassword === newPassword) {
      throw badRequest("كلمة المرور الجديدة يجب أن تختلف عن الحالية");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: await hashPassword(newPassword) },
    });

    // Revoke every existing session, then keep only this device signed in.
    await destroyAllSessions(user.id);
    await createSession(user.id);

    return NextResponse.json({
      success: true,
      message: "تم تغيير كلمة المرور، وتم تسجيل الخروج من الأجهزة الأخرى",
    });
  } catch (error) {
    return withRetryAfter(jsonError(error), error);
  }
}
