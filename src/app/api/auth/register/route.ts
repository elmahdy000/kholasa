import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";

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

    // Check if phone or email already registered
    const orConditions = [];
    if (phone && phone.trim()) orConditions.push({ phone: phone.trim() });
    if (email && email.trim()) orConditions.push({ email: email.trim().toLowerCase() });

    const existing = await prisma.user.findFirst({
      where: {
        OR: orConditions,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "رقم الهاتف أو البريد الإلكتروني مسجل بالفعل" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email: email || null,
        password: hashedPassword,
        systemId: systemId || null,
        gradeId: gradeId || null,
        role: "STUDENT",
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        systemId: true,
        gradeId: true,
      },
    });

    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user,
      message: "تم إنشاء الحساب بنجاح",
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء التسجيل" },
      { status: 500 }
    );
  }
}
