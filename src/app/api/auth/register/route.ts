import { NextResponse } from "next/server";
import { z } from "zod";
import { UserService } from "@/services";
import { createSession } from "@/lib/auth";

const registerSchema = z
  .object({
    name: z.string().min(2, "الاسم يجب أن يحتوي على حرفين على الأقل"),
    email: z.string().email("يرجى إدخال بريد إلكتروني صالح").optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    password: z.string().min(6, "كلمة المرور يجب أن لا تقل عن 6 أحرف"),
    systemId: z.string().optional(),
    gradeId: z.string().optional(),
  })
  .refine((data) => (data.email && data.email.length > 0) || (data.phone && data.phone.length > 0), {
    message: "يرجى إدخال البريد الإلكتروني أو رقم الهاتف",
    path: ["identifier"],
  });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const { name, email, phone, password, systemId, gradeId } = result.data;

    const user = await UserService.registerStudent({
      name,
      email,
      phone,
      password,
      systemId,
      gradeId,
    });

    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user,
      message: "تم إنشاء الحساب بنجاح",
    });
  } catch (error: any) {
    console.error("Register error:", error);
    const isConflict = error?.message?.includes("مسجل بالفعل");
    return NextResponse.json(
      { error: error?.message || "حدث خطأ غير متوقع أثناء التسجيل" },
      { status: isConflict ? 409 : 500 }
    );
  }
}

