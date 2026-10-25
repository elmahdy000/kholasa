import { NextResponse } from "next/server";
import { z } from "zod";
import { UserService } from "@/services";
import { createSession } from "@/lib/auth";
import { passwordSchema } from "@/lib/validation/auth";
import { conflict, jsonError, parseJson } from "@/lib/http";
import { getClientIp, rateLimit, withRetryAfter } from "@/lib/rate-limit";

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "الاسم يجب أن يحتوي على حرفين على الأقل").max(100),
    email: z.string().email("يرجى إدخال بريد إلكتروني صالح").optional().or(z.literal("")),
    phone: z.string().max(30).optional().or(z.literal("")),
    password: passwordSchema,
    systemId: z.string().optional(),
    gradeId: z.string().optional(),
  })
  .refine((data) => (data.email && data.email.length > 0) || (data.phone && data.phone.length > 0), {
    message: "يرجى إدخال البريد الإلكتروني أو رقم الهاتف",
    path: ["identifier"],
  });

export async function POST(req: Request) {
  try {
    rateLimit(`register:ip:${getClientIp(req)}`, 5, 60 * 60 * 1000);
    const { name, email, phone, password, systemId, gradeId } = await parseJson(req, registerSchema);

    let user;
    try {
      user = await UserService.registerStudent({ name, email, phone, password, systemId, gradeId });
    } catch (error) {
      if (error instanceof Error && error.message.includes("مسجل بالفعل")) {
        throw conflict(error.message);
      }
      throw error;
    }

    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user,
      message: "تم إنشاء الحساب بنجاح",
    });
  } catch (error) {
    return withRetryAfter(jsonError(error), error);
  }
}
