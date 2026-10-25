import { NextResponse } from "next/server";
import { z } from "zod";
import { UserService } from "@/services";
import { verifyPassword, createSession } from "@/lib/auth";
import { jsonError, parseJson, unauthorized } from "@/lib/http";
import { getClientIp, rateLimit, withRetryAfter } from "@/lib/rate-limit";

const loginSchema = z.object({
  identifier: z.string().min(3, "يرجى إدخال رقم الهاتف أو البريد الإلكتروني").max(254),
  password: z.string().min(1, "يرجى إدخال كلمة المرور").max(200),
});

const INVALID = "بيانات الدخول غير صحيحة، يرجى التأكد من الرقم أو كلمة المرور";

export async function POST(req: Request) {
  try {
    rateLimit(`login:ip:${getClientIp(req)}`, 5, 60 * 1000);
    const { identifier, password } = await parseJson(req, loginSchema);
    rateLimit(`login:id:${identifier.trim().toLowerCase()}`, 10, 15 * 60 * 1000);

    const user = await UserService.findByIdentifier(identifier);

    if (!user || !user.password) throw unauthorized(INVALID);

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) throw unauthorized(INVALID);

    await createSession(user.id);

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
